import totalWarXsRaw from './Total War I.xs?raw';
import totalWarXmlRaw from './Total War I.xml?raw';
import { RETOLD_TERRAIN_CATALOG } from '../textura/terreno/terrainCatalog';
import { WorldSizeId } from './mapCatalog';
import { RmsBuilderContext, RmsGeneratedMap } from './rmsEngine';

export interface ParsedMapXml {
  details: string;
  imagepath: string;
  displayNameID: string;
  cannotReplace: string;
  raw: string;
}

export interface RmsScriptTemplate {
  id: string;
  name: string;
  subtitle: string;
  sourceLabel: string;
  recommendedPlayers: number;
  xsCode: string;
  xmlCode: string;
}

export interface RmsCompileResult {
  map: RmsGeneratedMap;
  xmlMeta: ParsedMapXml;
  syntaxError?: { line: number; message: string };
}

export function parseMapXml(xmlText?: string): ParsedMapXml {
  const raw = (xmlText ?? '').trim();
  const extract = (attr: string) => {
    const re = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
    const m = raw.match(re);
    return m ? m[1] : '';
  };
  return {
    details: extract('details'),
    imagepath: extract('imagepath'),
    displayNameID: extract('displayNameID'),
    cannotReplace: extract('cannotReplace'),
    raw,
  };
}

// ── Lexer ──
type TokenKind =
  | 'ident'
  | 'number'
  | 'string'
  | 'punct'
  | 'eof';

interface Token {
  kind: TokenKind;
  value: string;
  line: number;
}

function tokenizeXs(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  const n = source.length;

  const twoCharOps = new Set(['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=']);

  while (i < n) {
    const ch = source[i];
    if (ch === '\n') {
      line++;
      i++;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i++;
      continue;
    }
    // Single-line comment
    if (ch === '/' && source[i + 1] === '/') {
      while (i < n && source[i] !== '\n') i++;
      continue;
    }
    // Multi-line comment
    if (ch === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') line++;
        i++;
      }
      i += 2;
      continue;
    }
    // Preprocessor / include directive (skip line gracefully)
    if (ch === '#') {
      while (i < n && source[i] !== '\n') i++;
      continue;
    }
    // String literal
    if (ch === '"' || ch === "'") {
      const quote = ch;
      const startLine = line;
      i++;
      let buf = '';
      while (i < n && source[i] !== quote) {
        if (source[i] === '\\' && i + 1 < n) {
          const next = source[i + 1];
          if (next === 'n') buf += '\n';
          else if (next === 't') buf += '\t';
          else buf += next;
          i += 2;
        } else {
          if (source[i] === '\n') line++;
          buf += source[i];
          i++;
        }
      }
      i++; // closing quote
      tokens.push({ kind: 'string', value: buf, line: startLine });
      continue;
    }
    // Number literal
    if ((ch >= '0' && ch <= '9') || (ch === '.' && source[i + 1] >= '0' && source[i + 1] <= '9')) {
      const start = i;
      let hasDot = false;
      while (i < n) {
        const c = source[i];
        if (c >= '0' && c <= '9') i++;
        else if (c === '.' && !hasDot) {
          hasDot = true;
          i++;
        } else break;
      }
      // Optional 'f' float suffix
      if (source[i] === 'f' || source[i] === 'F') i++;
      tokens.push({ kind: 'number', value: source.slice(start, i).replace(/[fF]$/, ''), line });
      continue;
    }
    // Identifier / keyword
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      const start = i;
      while (
        i < n &&
        ((source[i] >= 'a' && source[i] <= 'z') ||
          (source[i] >= 'A' && source[i] <= 'Z') ||
          (source[i] >= '0' && source[i] <= '9') ||
          source[i] === '_')
      ) {
        i++;
      }
      tokens.push({ kind: 'ident', value: source.slice(start, i), line });
      continue;
    }
    // Two-character operator
    const two = source.slice(i, i + 2);
    if (twoCharOps.has(two)) {
      tokens.push({ kind: 'punct', value: two, line });
      i += 2;
      continue;
    }
    // Single-character punctuation
    tokens.push({ kind: 'punct', value: ch, line });
    i++;
  }

  tokens.push({ kind: 'eof', value: '', line });
  return tokens;
}

// ── AST Types ──
type XsVal = number | string | boolean;

type Expr =
  | { kind: 'num'; val: number; line: number }
  | { kind: 'str'; val: string; line: number }
  | { kind: 'bool'; val: boolean; line: number }
  | { kind: 'ident'; name: string; line: number }
  | { kind: 'unary'; op: string; arg: Expr; line: number }
  | { kind: 'update'; op: '++' | '--'; name: string; prefix: boolean; line: number }
  | { kind: 'binary'; op: string; left: Expr; right: Expr; line: number }
  | { kind: 'assign'; op: string; name: string; value: Expr; line: number }
  | { kind: 'call'; name: string; args: Expr[]; line: number };

type Stmt =
  | { kind: 'block'; body: Stmt[]; line: number }
  | { kind: 'var'; name: string; init: Expr | null; line: number }
  | { kind: 'expr'; expr: Expr; line: number }
  | { kind: 'if'; test: Expr; cons: Stmt; alt: Stmt | null; line: number }
  | { kind: 'for'; init: Stmt | null; test: Expr | null; update: Expr | null; body: Stmt; line: number }
  | { kind: 'while'; test: Expr; body: Stmt; line: number }
  | { kind: 'break'; line: number }
  | { kind: 'continue'; line: number }
  | { kind: 'return'; value: Expr | null; line: number }
  | { kind: 'func'; name: string; params: string[]; body: Stmt; line: number }
  | { kind: 'empty'; line: number };

class XsSyntaxError extends Error {
  public line: number;
  constructor(line: number, message: string) {
    super(message);
    this.line = line;
  }
}

const TYPE_KEYWORDS = new Set(['int', 'float', 'string', 'bool', 'void', 'vector']);

class XsParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.tokens.length - 1, this.pos + offset)];
  }

  private next(): Token {
    const t = this.peek();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }

  private match(val: string, kind?: TokenKind): boolean {
    const t = this.peek();
    if (t.value === val && (!kind || t.kind === kind)) {
      this.next();
      return true;
    }
    return false;
  }

  private expect(val: string): Token {
    const t = this.peek();
    if (t.value !== val) {
      throw new XsSyntaxError(t.line, `Esperado "${val}", encontrado "${t.value || 'fim de arquivo'}"`);
    }
    return this.next();
  }

  public parseProgram(): Stmt[] {
    const stmts: Stmt[] = [];
    while (this.peek().kind !== 'eof') {
      // Skip `include "foo.xs";` statements gracefully
      if (this.peek().kind === 'ident' && this.peek().value === 'include') {
        this.next();
        if (this.peek().kind === 'string') this.next();
        this.match(';');
        continue;
      }
      stmts.push(this.parseTopOrStmt());
    }
    return stmts;
  }

  private parseTopOrStmt(): Stmt {
    const t = this.peek();

    // Optional `const` or `extern` or `static` qualifier
    if (t.kind === 'ident' && (t.value === 'const' || t.value === 'extern' || t.value === 'static' || t.value === 'mutable')) {
      this.next();
      return this.parseTopOrStmt();
    }

    // Type declaration or function declaration: `<type> <ident> (` or `<type> <ident> [= ...];`
    if (t.kind === 'ident' && TYPE_KEYWORDS.has(t.value)) {
      const line = t.line;
      this.next(); // consume type
      const nameTok = this.peek();
      if (nameTok.kind !== 'ident') {
        throw new XsSyntaxError(nameTok.line, `Nome de identificador esperado após tipo "${t.value}"`);
      }
      this.next();
      // Function declaration
      if (this.match('(')) {
        const params: string[] = [];
        if (!this.match(')')) {
          while (this.peek().kind !== 'eof') {
            if (this.peek().kind === 'ident' && this.peek().value === 'void' && this.peek(1).value === ')') {
              this.next();
              break;
            }
            // Optional type
            if (this.peek().kind === 'ident' && (TYPE_KEYWORDS.has(this.peek().value) || this.peek().value === 'const')) {
              this.next();
              if (this.peek().kind === 'ident' && TYPE_KEYWORDS.has(this.peek().value)) this.next();
            }
            if (this.peek().kind === 'ident') {
              params.push(this.next().value);
            }
            // Optional default parameter value `= expr`
            if (this.match('=')) {
              this.parseExpression();
            }
            if (!this.match(',')) break;
          }
          this.expect(')');
        }
        const body = this.parseBlock();
        return { kind: 'func', name: nameTok.value, params, body, line };
      }

      // Variable declaration
      let init: Expr | null = null;
      if (this.match('=')) {
        init = this.parseExpression();
      }
      this.match(';');
      return { kind: 'var', name: nameTok.value, init, line };
    }

    return this.parseStatement();
  }

  private parseStatement(): Stmt {
    const t = this.peek();
    if (t.value === '{') return this.parseBlock();
    if (t.value === ';') {
      this.next();
      return { kind: 'empty', line: t.line };
    }
    if (t.kind === 'ident' && (t.value === 'const' || TYPE_KEYWORDS.has(t.value))) {
      return this.parseTopOrStmt();
    }
    if (t.kind === 'ident' && t.value === 'if') {
      return this.parseIf();
    }
    if (t.kind === 'ident' && t.value === 'for') {
      return this.parseFor();
    }
    if (t.kind === 'ident' && t.value === 'while') {
      return this.parseWhile();
    }
    if (t.kind === 'ident' && t.value === 'break') {
      this.next();
      this.match(';');
      return { kind: 'break', line: t.line };
    }
    if (t.kind === 'ident' && t.value === 'continue') {
      this.next();
      this.match(';');
      return { kind: 'continue', line: t.line };
    }
    if (t.kind === 'ident' && t.value === 'return') {
      this.next();
      let value: Expr | null = null;
      if (this.peek().value !== ';' && this.peek().value !== '}') {
        value = this.parseExpression();
      }
      this.match(';');
      return { kind: 'return', value, line: t.line };
    }

    const expr = this.parseExpression();
    this.match(';');
    return { kind: 'expr', expr, line: t.line };
  }

  private parseBlock(): Stmt {
    const open = this.expect('{');
    const body: Stmt[] = [];
    while (this.peek().kind !== 'eof' && this.peek().value !== '}') {
      body.push(this.parseStatement());
    }
    this.expect('}');
    return { kind: 'block', body, line: open.line };
  }

  private parseIf(): Stmt {
    const kw = this.next(); // 'if'
    this.expect('(');
    const test = this.parseExpression();
    this.expect(')');
    const cons = this.parseStatement();
    let alt: Stmt | null = null;
    if (this.peek().kind === 'ident' && this.peek().value === 'else') {
      this.next();
      alt = this.parseStatement();
    }
    return { kind: 'if', test, cons, alt, line: kw.line };
  }

  private parseWhile(): Stmt {
    const kw = this.next();
    this.expect('(');
    const test = this.parseExpression();
    this.expect(')');
    const body = this.parseStatement();
    return { kind: 'while', test, body, line: kw.line };
  }

  /**
   * Supports BOTH:
   * - AoM / AoM:Retold shorthand: `for (i = 1; < cNumberPlayers)` or `for (j=1; <= 5*cNumberNonGaiaPlayers)`
   * - Standard C-style: `for (int i = 0; i < N; i++)`
   */
  private parseFor(): Stmt {
    const kw = this.next(); // 'for'
    this.expect('(');

    let init: Stmt | null = null;
    let loopVarName: string | null = null;

    if (!this.match(';')) {
      if (this.peek().kind === 'ident' && TYPE_KEYWORDS.has(this.peek().value)) {
        const line = this.peek().line;
        this.next();
        const nm = this.next();
        loopVarName = nm.value;
        let initExpr: Expr | null = null;
        if (this.match('=')) initExpr = this.parseExpression();
        init = { kind: 'var', name: nm.value, init: initExpr, line };
      } else {
        const expr = this.parseExpression();
        if (expr.kind === 'assign') loopVarName = expr.name;
        else if (expr.kind === 'ident') loopVarName = expr.name;
        init = { kind: 'expr', expr, line: expr.line };
      }
      this.expect(';');
    }

    let test: Expr | null = null;
    let update: Expr | null = null;

    // Detect AoM shorthand condition starting directly with `<`, `<=`, `>`, `>=`
    const condTok = this.peek();
    if (
      (condTok.value === '<' || condTok.value === '<=' || condTok.value === '>' || condTok.value === '>=') &&
      loopVarName
    ) {
      const op = this.next().value;
      const right = this.parseExpression();
      test = {
        kind: 'binary',
        op,
        left: { kind: 'ident', name: loopVarName, line: condTok.line },
        right,
        line: condTok.line,
      };
      // Optional third clause if `;` is present; otherwise default ++ (or -- for >/>=)
      if (this.match(';')) {
        if (this.peek().value !== ')') {
          update = this.parseExpression();
        }
      } else {
        update = {
          kind: 'update',
          op: op === '>' || op === '>=' ? '--' : '++',
          name: loopVarName,
          prefix: false,
          line: condTok.line,
        };
      }
      this.expect(')');
    } else {
      if (!this.match(';')) {
        test = this.parseExpression();
        this.expect(';');
      }
      if (this.peek().value !== ')') {
        update = this.parseExpression();
      }
      this.expect(')');
    }

    const body = this.parseStatement();
    return { kind: 'for', init, test, update, body, line: kw.line };
  }

  private parseExpression(): Expr {
    return this.parseAssignment();
  }

  private parseAssignment(): Expr {
    const left = this.parseOr();
    const op = this.peek().value;
    if (op === '=' || op === '+=' || op === '-=' || op === '*=' || op === '/=') {
      if (left.kind !== 'ident') {
        throw new XsSyntaxError(this.peek().line, 'Alvo de atribuição inválido');
      }
      this.next();
      const value = this.parseAssignment();
      return { kind: 'assign', op, name: left.name, value, line: left.line };
    }
    return left;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.match('||')) {
      const line = left.line;
      left = { kind: 'binary', op: '||', left, right: this.parseAnd(), line };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseEquality();
    while (this.match('&&')) {
      const line = left.line;
      left = { kind: 'binary', op: '&&', left, right: this.parseEquality(), line };
    }
    return left;
  }

  private parseEquality(): Expr {
    let left = this.parseComparison();
    while (this.peek().value === '==' || this.peek().value === '!=') {
      const op = this.next().value;
      left = { kind: 'binary', op, left, right: this.parseComparison(), line: left.line };
    }
    return left;
  }

  private parseComparison(): Expr {
    let left = this.parseTerm();
    while (
      this.peek().value === '<' ||
      this.peek().value === '<=' ||
      this.peek().value === '>' ||
      this.peek().value === '>='
    ) {
      const op = this.next().value;
      left = { kind: 'binary', op, left, right: this.parseTerm(), line: left.line };
    }
    return left;
  }

  private parseTerm(): Expr {
    let left = this.parseFactor();
    while (this.peek().value === '+' || this.peek().value === '-') {
      const op = this.next().value;
      left = { kind: 'binary', op, left, right: this.parseFactor(), line: left.line };
    }
    return left;
  }

  private parseFactor(): Expr {
    let left = this.parseUnary();
    while (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%') {
      const op = this.next().value;
      left = { kind: 'binary', op, left, right: this.parseUnary(), line: left.line };
    }
    return left;
  }

  private parseUnary(): Expr {
    const t = this.peek();
    if (t.value === '-' || t.value === '!' || t.value === '+') {
      this.next();
      return { kind: 'unary', op: t.value, arg: this.parseUnary(), line: t.line };
    }
    if (t.value === '++' || t.value === '--') {
      this.next();
      const nm = this.next();
      if (nm.kind !== 'ident') throw new XsSyntaxError(nm.line, `Identificador esperado após ${t.value}`);
      return { kind: 'update', op: t.value, name: nm.value, prefix: true, line: t.line };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const t = this.peek();
    if (t.kind === 'number') {
      this.next();
      return { kind: 'num', val: Number(t.value), line: t.line };
    }
    if (t.kind === 'string') {
      this.next();
      return { kind: 'str', val: t.value, line: t.line };
    }
    if (t.kind === 'ident' && (t.value === 'true' || t.value === 'false')) {
      this.next();
      return { kind: 'bool', val: t.value === 'true', line: t.line };
    }
    if (t.value === '(') {
      this.next();
      const expr = this.parseExpression();
      this.expect(')');
      return expr;
    }
    if (t.kind === 'ident') {
      this.next();
      if (this.match('(')) {
        const args: Expr[] = [];
        if (this.peek().value !== ')') {
          do {
            args.push(this.parseExpression());
          } while (this.match(','));
        }
        this.expect(')');
        return { kind: 'call', name: t.value, args, line: t.line };
      }
      if (this.peek().value === '++' || this.peek().value === '--') {
        const op = this.next().value as '++' | '--';
        return { kind: 'update', op, name: t.value, prefix: false, line: t.line };
      }
      return { kind: 'ident', name: t.value, line: t.line };
    }
    throw new XsSyntaxError(t.line, `Token inesperado: "${t.value || 'EOF'}"`);
  }
}

// ── Control Flow Signals ──
class BreakSignal {}
class ContinueSignal {}
class ReturnSignal {
  public value: XsVal;
  constructor(val: XsVal) {
    this.value = val;
  }
}

// ── Runtime Evaluator ──
class XsEvaluator {
  private scopes: Map<string, XsVal>[] = [new Map()];
  private functions = new Map<string, { params: string[]; body: Stmt }>();
  private builtins: Record<string, (...args: XsVal[]) => XsVal>;
  private steps = 0;
  private maxSteps = 50000;

  constructor(ctx: RmsBuilderContext) {
    // Standard AoM / AoMR RMS Global Constants + MythRMConstants (cTerrain*, cCliff*, cUnitRock*, cFx*)
    const globals = this.scopes[0];
    for (const t of RETOLD_TERRAIN_CATALOG) {
      globals.set(t.rmConstant, t.xsName);
    }
    globals.set('cCliffGreekMarble', 'GreekCliff');
    globals.set('cCliffNorseGranite', 'NorseCliff');
    globals.set('cCliffEgyptianSandstone', 'EgyptianCliff');
    globals.set('cCliffIceGlacier', 'IceCliff');
    globals.set('cCliffHadesObsidian', 'HadesCliff');
    globals.set('cUnitRockGraniteSmall', 'Rock Granite Small');
    globals.set('cUnitRockGraniteLarge', 'Rock Granite Large');
    globals.set('cUnitBasaltPillar', 'Basalt Pillar');
    globals.set('cUnitStalagmite', 'Stalagmite');
    globals.set('cFxWindDust', 'FX Wind Dust');
    globals.set('cFxVolcanicSmoke', 'FX Volcanic Smoke');
    globals.set('cFxMagmaSparks', 'FX Magma Sparks');
    globals.set('cFxLowMist', 'FX Low Mist');
    globals.set('cFxSunbeams', 'FX Sunbeams');
    globals.set('cNumberNonGaiaPlayers', ctx.playerCount);
    globals.set('cNumberPlayers', ctx.playerCount + 1);
    globals.set('cMapSize', ctx.worldSize === 'normal' ? 0 : 1);
    globals.set('cConnectAreas', 1);
    globals.set('cConnectAllies', 2);
    globals.set('cConnectPlayers', 3);
    globals.set('cConnectAll', 4);
    globals.set('PI', Math.PI);
    globals.set('true', true);
    globals.set('false', false);

    const num = (v: XsVal | undefined, fb = 0) => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : Number(v ?? fb) || fb);
    const str = (v: XsVal | undefined, fb = '') => (v === undefined ? fb : String(v));
    const bool = (v: XsVal | undefined, fb = false) =>
      v === undefined ? fb : typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : v !== '' && v !== 'false';

    this.builtins = {
      // Math
      sqrt: (x) => Math.sqrt(Math.max(0, num(x))),
      sin: (x) => Math.sin(num(x)),
      cos: (x) => Math.cos(num(x)),
      abs: (x) => Math.abs(num(x)),
      floor: (x) => Math.floor(num(x)),
      ceil: (x) => Math.ceil(num(x)),
      min: (a, b) => Math.min(num(a), num(b)),
      max: (a, b) => Math.max(num(a), num(b)),
      pow: (a, b) => Math.pow(num(a), num(b)),

      // Random
      rmRandInt: (a, b) => ctx.rmRandInt(num(a), num(b)),
      rmRandFloat: (a, b) => ctx.rmRandFloat(num(a), num(b)),

      // Map Setup & Coordinate Conversions
      rmSetMapSize: (x, z) => {
        ctx.rmSetMapSize(num(x, 240), num(z, num(x, 240)));
        return 0;
      },
      rmSetSeaLevel: (l) => {
        ctx.rmSetSeaLevel(num(l));
        return 0;
      },
      rmSetSeaType: (s) => {
        ctx.rmSetSeaType(str(s));
        return 0;
      },
      rmTerrainInitialize: (t, h) => {
        ctx.rmTerrainInitialize(str(t, 'grass'), h !== undefined ? num(h) : 0.5);
        return 0;
      },
      rmXTilesToFraction: (t) => ctx.rmXTilesToFraction(num(t)),
      rmZTilesToFraction: (t) => ctx.rmZTilesToFraction(num(t)),
      rmAreaTilesToFraction: (t) => ctx.rmAreaTilesToFraction(num(t)),
      rmAreaFractionToTiles: (f) => ctx.rmAreaFractionToTiles(num(f)),
      rmXFractionToMeters: (f) => ctx.rmXFractionToMeters(num(f)),
      rmZFractionToMeters: (f) => ctx.rmZFractionToMeters(num(f)),
      rmXMetersToFraction: (m) => ctx.rmXMetersToFraction(num(m)),
      rmZMetersToFraction: (m) => ctx.rmZMetersToFraction(num(m)),

      // Classes
      rmDefineClass: (name) => ctx.rmDefineClass(str(name)),

      // Constraints
      rmCreateBoxConstraint: (name, x1, z1, x2, z2) =>
        ctx.rmCreateBoxConstraint(str(name), num(x1), num(z1), num(x2, 1), num(z2, 1)),
      rmCreateTerrainDistanceConstraint: (name, terrain, avoid, dist) =>
        ctx.rmCreateTerrainDistanceConstraint(str(name), str(terrain), bool(avoid), num(dist, 4)),
      rmCreateTypeDistanceConstraint: (name, typeName, dist) =>
        ctx.rmCreateTypeDistanceConstraint(str(name), str(typeName), num(dist, 8)),
      rmCreateClassDistanceConstraint: (name, classId, dist) =>
        ctx.rmCreateClassDistanceConstraint(str(name), num(classId), num(dist, 8)),
      rmCreateEdgeDistanceConstraint: (name, areaId, dist) =>
        ctx.rmCreateEdgeDistanceConstraint(str(name), num(areaId), num(dist, 6)),
      rmCreateAreaDistanceConstraint: (name, areaId, dist) =>
        ctx.rmCreateAreaDistanceConstraint(str(name), num(areaId), num(dist, 6)),

      // Players
      rmPlacePlayersCircular: (minR, maxR, angleVar) => {
        ctx.rmPlacePlayersCircular(num(minR, 0.35), num(maxR, num(minR, 0.35)), num(angleVar, 0));
        return 0;
      },
      rmPlacePlayersLine: (x1, z1, x2, z2) => {
        ctx.rmPlacePlayersLine(num(x1, 0.15), num(z1, 0.85), num(x2, 0.85), num(z2, 0.15));
        return 0;
      },
      rmPlayerLocXFraction: (p) => ctx.rmPlayerLocXFraction(num(p, 1)),
      rmPlayerLocZFraction: (p) => ctx.rmPlayerLocZFraction(num(p, 1)),
      rmSetPlayerArea: (p, a) => {
        ctx.rmSetPlayerArea(num(p, 1), num(a));
        return 0;
      },
      rmGetPlayerName: (p) => `Jogador ${num(p, 1)}`,

      // Areas (classic + AoMR aliases)
      rmCreateArea: (name, parentId) => ctx.rmCreateArea(str(name), parentId !== undefined ? num(parentId) : undefined),
      rmAreaCreate: (name, parentId) => ctx.rmCreateArea(str(name), parentId !== undefined ? num(parentId) : undefined),
      rmSetAreaTerrainType: (id, t) => {
        ctx.rmSetAreaTerrainType(num(id), str(t));
        return 0;
      },
      rmSetAreaCliffType: (id, cliffType) => {
        ctx.rmSetAreaCliffType(num(id), str(cliffType));
        return 0;
      },
      rmSetAreaBaseHeight: (id, h) => {
        ctx.rmSetAreaBaseHeight(num(id), num(h, 2));
        return 0;
      },
      rmSetAreaCoherence: (id, c) => {
        ctx.rmSetAreaCoherence(num(id), num(c, 0.7));
        return 0;
      },
      rmSetAreaHeightBlend: (id, b) => {
        ctx.rmSetAreaHeightBlend(num(id), num(b, 2));
        return 0;
      },
      rmSetAreaSmoothDistance: (id, d) => {
        ctx.rmSetAreaSmoothDistance(num(id), num(d, 2));
        return 0;
      },
      rmSetAreaLocation: (id, x, z) => {
        ctx.rmSetAreaLocation(num(id), num(x, 0.5), num(z, 0.5));
        return 0;
      },
      rmSetAreaLocPlayer: (id, p) => {
        ctx.rmSetAreaLocPlayer(num(id), num(p, 1));
        return 0;
      },
      rmSetAreaSize: (id, minF, maxF) => {
        ctx.rmSetAreaSize(num(id), num(minF, 0.04), maxF !== undefined ? num(maxF) : undefined);
        return 0;
      },
      rmSetAreaMinBlobs: (id, n) => {
        ctx.rmSetAreaMinBlobs(num(id), num(n, 1));
        return 0;
      },
      rmSetAreaMaxBlobs: (id, n) => {
        ctx.rmSetAreaMaxBlobs(num(id), num(n, 3));
        return 0;
      },
      rmSetAreaWarnFailure: (id, w) => {
        ctx.rmSetAreaWarnFailure(num(id), bool(w, true));
        return 0;
      },
      rmAddAreaToClass: (id, c) => {
        ctx.rmAddAreaToClass(num(id), num(c));
        return 0;
      },
      rmAddAreaConstraint: (id, c) => {
        ctx.rmAddAreaConstraint(num(id), num(c));
        return 0;
      },
      rmBuildArea: (id) => ctx.rmBuildArea(num(id)),
      rmAreaBuild: (id) => ctx.rmBuildArea(num(id)),
      rmBuildAllAreas: () => {
        ctx.rmBuildAllAreas();
        return 0;
      },

      // Connections
      rmCreateConnection: (name) => ctx.rmCreateConnection(str(name)),
      rmSetConnectionType: (id, t) => {
        ctx.rmSetConnectionType(num(id), num(t, 1));
        return 0;
      },
      rmAddConnectionArea: (id, areaId) => {
        ctx.rmAddConnectionArea(num(id), num(areaId));
        return 0;
      },
      rmSetConnectionBaseHeight: (id, h) => {
        ctx.rmSetConnectionBaseHeight(num(id), num(h, 2));
        return 0;
      },
      rmSetConnectionWidth: (id, w) => {
        ctx.rmSetConnectionWidth(num(id), num(w, 10));
        return 0;
      },
      rmSetConnectionCoherence: (id, c) => {
        ctx.rmSetConnectionCoherence(num(id), num(c, 0.6));
        return 0;
      },
      rmSetConnectionSmoothDistance: (id, d) => {
        ctx.rmSetConnectionSmoothDistance(num(id), num(d, 2));
        return 0;
      },
      rmBuildConnection: (id) => ctx.rmBuildConnection(num(id)),

      // Objects
      rmCreateObjectDef: (name) => ctx.rmCreateObjectDef(str(name)),
      rmAddObjectDefItem: (id, proto, count, dist) => {
        ctx.rmAddObjectDefItem(num(id), str(proto), num(count, 1), num(dist, 2));
        return 0;
      },
      rmAddObjectDefConstraint: (id, cid) => {
        ctx.rmAddObjectDefConstraint(num(id), num(cid));
        return 0;
      },
      rmSetObjectDefMinDistance: (id, d) => {
        ctx.rmSetObjectDefMinDistance(num(id), num(d, 0));
        return 0;
      },
      rmSetObjectDefMaxDistance: (id, d) => {
        ctx.rmSetObjectDefMaxDistance(num(id), num(d, 40));
        return 0;
      },
      rmPlaceObjectDefPerPlayer: (id, belongs, count) => {
        ctx.rmPlaceObjectDefPerPlayer(num(id), bool(belongs, false), num(count, 1));
        return 0;
      },
      rmPlaceObjectDefInArea: (id, playerSlot, areaId, count) => {
        ctx.rmPlaceObjectDefInArea(num(id), num(playerSlot, 0), num(areaId), num(count, 1));
        return 0;
      },
      rmPlaceObjectDefAtLoc: (id, playerSlot, fx, fz, count) => {
        ctx.rmPlaceObjectDefAtLoc(num(id), num(playerSlot, 0), num(fx, 0.5), num(fz, 0.5), num(count, 1));
        return 0;
      },

      // Triggers
      rmCreateTrigger: (name) => ctx.rmCreateTrigger(str(name)),
      rmTriggerID: (name) => ctx.rmTriggerID(str(name)),
      rmSwitchToTrigger: (id) => {
        ctx.rmSwitchToTrigger(num(id));
        return 0;
      },
      rmAddTriggerCondition: (t) => {
        ctx.rmAddTriggerCondition(str(t));
        return 0;
      },
      rmSetTriggerConditionParam: (k, v) => {
        ctx.rmSetTriggerConditionParam(str(k), typeof v === 'number' ? v : str(v));
        return 0;
      },
      rmSetTriggerConditionParamInt: (k, v) => {
        ctx.rmSetTriggerConditionParam(str(k), num(v));
        return 0;
      },
      rmAddTriggerEffect: (t) => {
        ctx.rmAddTriggerEffect(str(t));
        return 0;
      },
      rmSetTriggerEffectParam: (k, v) => {
        ctx.rmSetTriggerEffectParam(str(k), typeof v === 'number' ? v : str(v));
        return 0;
      },
      rmSetTriggerEffectParamInt: (k, v) => {
        ctx.rmSetTriggerEffectParam(str(k), num(v));
        return 0;
      },
      rmSetTriggerActive: (v) => {
        ctx.rmSetTriggerActive(bool(v, true));
        return 0;
      },
      rmSetTriggerLoop: (v) => {
        ctx.rmSetTriggerLoop(bool(v, false));
        return 0;
      },
      rmSetTriggerRunImmediately: (v) => {
        ctx.rmSetTriggerRunImmediately(bool(v, false));
        return 0;
      },
      rmSetTriggerPriority: (p) => {
        ctx.rmSetTriggerPriority(num(p, 4));
        return 0;
      },

      // Cosmetic / Engine No-ops (supported so real AoM/AoMR scripts execute cleanly without warnings)
      rmSetStatusText: () => 0,
      rmAddAreaTerrainLayer: () => 0,
      rmAddAreaRemoveType: () => 0,
      rmAddConnectionTerrainReplacement: () => 0,
      rmSetAreaMinBlobDistance: () => 0,
      rmSetAreaMaxBlobDistance: () => 0,
      rmSetAreaForestType: (id, t) => {
        ctx.rmSetAreaTerrainType(num(id), `Forest ${str(t)}`);
        return 0;
      },
      rmSetLightingSet: () => 0,
      rmSetGlobalSnow: () => 0,
      rmSetGlobalRain: () => 0,
      rmEchoInfo: (msg) => {
        ctx.log('info', 'Script', str(msg));
        return 0;
      },
      rmEchoWarning: (msg) => {
        ctx.log('warn', 'Script', str(msg));
        return 0;
      },
      rmEchoError: (msg) => {
        ctx.log('error', 'Script', str(msg));
        return 0;
      },
    };
  }

  private getVar(name: string): XsVal {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) return this.scopes[i].get(name)!;
    }
    return 0;
  }

  private declareVar(name: string, val: XsVal) {
    this.scopes[this.scopes.length - 1].set(name, val);
  }

  private setVar(name: string, val: XsVal) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        this.scopes[i].set(name, val);
        return;
      }
    }
    // Auto-declare undeclared variables (AoM `.xs` allows undeclared loop counters like `for (i = 1; < N)`)
    this.scopes[this.scopes.length - 1].set(name, val);
  }

  public run(program: Stmt[]) {
    for (const stmt of program) {
      if (stmt.kind === 'func') {
        this.functions.set(stmt.name, { params: stmt.params, body: stmt.body });
      } else {
        this.execStmt(stmt);
      }
    }

    const entry = this.functions.get('main') ?? this.functions.get('generate');
    if (entry) {
      this.invokeUserFunc(entry, []);
    }
  }

  private invokeUserFunc(fn: { params: string[]; body: Stmt }, args: XsVal[]): XsVal {
    const scope = new Map<string, XsVal>();
    for (let i = 0; i < fn.params.length; i++) {
      scope.set(fn.params[i], args[i] ?? 0);
    }
    this.scopes.push(scope);
    try {
      this.execStmt(fn.body);
    } catch (e) {
      if (e instanceof ReturnSignal) {
        this.scopes.pop();
        return e.value;
      }
      this.scopes.pop();
      throw e;
    }
    this.scopes.pop();
    return 0;
  }

  private execStmt(stmt: Stmt): void {
    if (++this.steps > this.maxSteps) {
      throw new XsSyntaxError(stmt.line, 'Limite de segurança de instruções excedido (loop infinito detectado)');
    }
    switch (stmt.kind) {
      case 'empty':
      case 'func':
        return;
      case 'block': {
        this.scopes.push(new Map());
        try {
          for (const s of stmt.body) this.execStmt(s);
        } finally {
          this.scopes.pop();
        }
        return;
      }
      case 'var': {
        const v = stmt.init ? this.evalExpr(stmt.init) : 0;
        this.declareVar(stmt.name, v);
        return;
      }
      case 'expr': {
        this.evalExpr(stmt.expr);
        return;
      }
      case 'if': {
        if (this.isTruthy(this.evalExpr(stmt.test))) {
          this.execStmt(stmt.cons);
        } else if (stmt.alt) {
          this.execStmt(stmt.alt);
        }
        return;
      }
      case 'while': {
        while (this.isTruthy(this.evalExpr(stmt.test))) {
          if (++this.steps > this.maxSteps) {
            throw new XsSyntaxError(stmt.line, 'Limite de segurança em loop while excedido');
          }
          try {
            this.execStmt(stmt.body);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      }
      case 'for': {
        this.scopes.push(new Map());
        try {
          if (stmt.init) this.execStmt(stmt.init);
          while (!stmt.test || this.isTruthy(this.evalExpr(stmt.test))) {
            if (++this.steps > this.maxSteps) {
              throw new XsSyntaxError(stmt.line, 'Limite de segurança em loop for excedido');
            }
            try {
              this.execStmt(stmt.body);
            } catch (e) {
              if (e instanceof BreakSignal) break;
              if (e instanceof ContinueSignal) {
                if (stmt.update) this.evalExpr(stmt.update);
                continue;
              }
              throw e;
            }
            if (stmt.update) this.evalExpr(stmt.update);
          }
        } finally {
          this.scopes.pop();
        }
        return;
      }
      case 'break':
        throw new BreakSignal();
      case 'continue':
        throw new ContinueSignal();
      case 'return':
        throw new ReturnSignal(stmt.value ? this.evalExpr(stmt.value) : 0);
    }
  }

  private isTruthy(v: XsVal): boolean {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0 && !Number.isNaN(v);
    return v.length > 0 && v !== 'false';
  }

  private evalExpr(expr: Expr): XsVal {
    switch (expr.kind) {
      case 'num':
        return expr.val;
      case 'str':
        return expr.val;
      case 'bool':
        return expr.val;
      case 'ident':
        return this.getVar(expr.name);
      case 'unary': {
        const v = this.evalExpr(expr.arg);
        if (expr.op === '-') return -Number(v);
        if (expr.op === '+') return +Number(v);
        if (expr.op === '!') return !this.isTruthy(v);
        return v;
      }
      case 'update': {
        const cur = Number(this.getVar(expr.name)) || 0;
        const next = expr.op === '++' ? cur + 1 : cur - 1;
        this.setVar(expr.name, next);
        return expr.prefix ? next : cur;
      }
      case 'assign': {
        const rhs = this.evalExpr(expr.value);
        if (expr.op === '=') {
          this.setVar(expr.name, rhs);
          return rhs;
        }
        const cur = this.getVar(expr.name);
        let res: XsVal = rhs;
        if (expr.op === '+=') {
          res = typeof cur === 'string' || typeof rhs === 'string' ? String(cur) + String(rhs) : Number(cur) + Number(rhs);
        } else if (expr.op === '-=') {
          res = Number(cur) - Number(rhs);
        } else if (expr.op === '*=') {
          res = Number(cur) * Number(rhs);
        } else if (expr.op === '/=') {
          res = Number(rhs) !== 0 ? Number(cur) / Number(rhs) : 0;
        }
        this.setVar(expr.name, res);
        return res;
      }
      case 'binary': {
        if (expr.op === '&&') {
          return this.isTruthy(this.evalExpr(expr.left)) && this.isTruthy(this.evalExpr(expr.right));
        }
        if (expr.op === '||') {
          return this.isTruthy(this.evalExpr(expr.left)) || this.isTruthy(this.evalExpr(expr.right));
        }
        const l = this.evalExpr(expr.left);
        const r = this.evalExpr(expr.right);
        switch (expr.op) {
          case '+':
            return typeof l === 'string' || typeof r === 'string' ? String(l) + String(r) : Number(l) + Number(r);
          case '-':
            return Number(l) - Number(r);
          case '*':
            return Number(l) * Number(r);
          case '/':
            return Number(r) !== 0 ? Number(l) / Number(r) : 0;
          case '%':
            return Number(r) !== 0 ? Number(l) % Number(r) : 0;
          case '==':
            return l === r || (typeof l === 'boolean' && typeof r === 'number' && Number(l) === r);
          case '!=':
            return l !== r;
          case '<':
            return Number(l) < Number(r);
          case '<=':
            return Number(l) <= Number(r);
          case '>':
            return Number(l) > Number(r);
          case '>=':
            return Number(l) >= Number(r);
          default:
            return 0;
        }
      }
      case 'call': {
        const argVals = expr.args.map((a) => this.evalExpr(a));
        const builtin = this.builtins[expr.name];
        if (builtin) return builtin(...argVals);
        const userFn = this.functions.get(expr.name);
        if (userFn) return this.invokeUserFunc(userFn, argVals);
        return 0;
      }
    }
  }
}

// ── Built-in AoM / AoMR Script Library ──

const ALFHEIM_RMS_XS = `// Alfheim — Modelo AoM: Retold RMS
// Inspirado no guia de Random Map Scripting (Áreas + Restrições + Conexões + Recursos Justos)
void main(void) {
    int myTiles = 7500;
    if (cMapSize == 1) { myTiles = 10500; }
    int mySize = 2 * sqrt(cNumberNonGaiaPlayers * myTiles);
    rmSetMapSize(mySize, mySize);
    rmSetSeaLevel(0);
    rmSetSeaType("Norwegian Sea");
    rmTerrainInitialize("GrassB", 2.0);

    int classPlayer = rmDefineClass("player");
    int classForest = rmDefineClass("forest");

    // Restrições de equilíbrio
    int avoidLandEdge = rmCreateBoxConstraint("margem mapa", 0.08, 0.08, 0.92, 0.92);
    int avoidPlayer = rmCreateClassDistanceConstraint("longe jogadores", classPlayer, 22.0);
    int avoidForest = rmCreateClassDistanceConstraint("longe floresta", classForest, 12.0);
    int avoidSettlement = rmCreateTypeDistanceConstraint("longe assentamento", "AbstractSettlement", 32.0);
    int avoidGold = rmCreateTypeDistanceConstraint("longe ouro", "Gold Mine", 24.0);
    int avoidRelic = rmCreateTypeDistanceConstraint("longe reliquia", "Relic", 28.0);
    int onLand = rmCreateTerrainDistanceConstraint("em terra", "land", false, 1.0);

    // Jogadores em círculo simétrico
    rmPlacePlayersCircular(0.35, 0.35, 0.04);

    // Colinas nórdicas centrais
    int hillCount = cNumberNonGaiaPlayers + 2;
    for (int h = 0; h < hillCount; h++) {
        int hillID = rmCreateArea("colina_" + h);
        rmSetAreaTerrainType(hillID, "SnowGrass50");
        rmSetAreaBaseHeight(hillID, 4.5);
        rmSetAreaCoherence(hillID, 0.55);
        rmSetAreaSize(hillID, 0.025, 0.045);
        rmAddAreaConstraint(hillID, avoidPlayer);
        rmAddAreaConstraint(hillID, avoidLandEdge);
        rmSetAreaWarnFailure(hillID, false);
        rmBuildArea(hillID);
    }

    // Bases dos jogadores e estradas conectando ao centro
    int centerID = rmCreateArea("clareira_central");
    rmSetAreaTerrainType(centerID, "GrassDirt25");
    rmSetAreaLocation(centerID, 0.5, 0.5);
    rmSetAreaSize(centerID, 0.05, 0.05);
    rmSetAreaBaseHeight(centerID, 2.0);
    rmBuildArea(centerID);

    for (int i = 1; i <= cNumberNonGaiaPlayers; i++) {
        int pArea = rmCreateArea("Player" + i);
        rmSetAreaLocPlayer(pArea, i);
        rmSetAreaTerrainType(pArea, "NorseRoadA");
        rmSetAreaBaseHeight(pArea, 2.0);
        rmSetAreaSize(pArea, 0.03, 0.03);
        rmAddAreaToClass(pArea, classPlayer);
        rmBuildArea(pArea);

        int road = rmCreateConnection("estrada_jogador_" + i);
        rmSetConnectionType(road, cConnectAreas, true, 100);
        rmAddConnectionArea(road, pArea);
        rmAddConnectionArea(road, centerID);
        rmSetConnectionWidth(road, 8.0, 0.0);
        rmSetConnectionBaseHeight(road, 2.0);
        rmBuildConnection(road);
    }

    // Bosques de pinheiros nórdicos
    for (int f = 0; f < cNumberNonGaiaPlayers * 4; f++) {
        int forestID = rmCreateArea("floresta_" + f);
        rmSetAreaTerrainType(forestID, "Forest Pine");
        rmSetAreaSize(forestID, 0.014, 0.024);
        rmSetAreaCoherence(forestID, 0.45);
        rmAddAreaToClass(forestID, classForest);
        rmAddAreaConstraint(forestID, avoidPlayer);
        rmAddAreaConstraint(forestID, avoidForest);
        rmAddAreaConstraint(forestID, avoidLandEdge);
        rmSetAreaWarnFailure(forestID, false);
        if (rmBuildArea(forestID)) {
            int treeDef = rmCreateObjectDef("pinheiros_" + f);
            rmAddObjectDefItem(treeDef, "Pine", 5, 6.0);
            rmPlaceObjectDefInArea(treeDef, 0, forestID, 1);
        }
    }

    // Centro da Cidade, Ouro, Frutas, Rebanhos e Caça justa por jogador
    int tcDef = rmCreateObjectDef("town center");
    rmAddObjectDefItem(tcDef, "Settlement Level 1", 1, 0.0);
    rmPlaceObjectDefPerPlayer(tcDef, true, 1);

    int startGold = rmCreateObjectDef("ouro inicial");
    rmAddObjectDefItem(startGold, "Gold Mine", 1, 0.0);
    rmSetObjectDefMinDistance(startGold, 18.0);
    rmSetObjectDefMaxDistance(startGold, 28.0);
    rmAddObjectDefConstraint(startGold, onLand);
    rmAddObjectDefConstraint(startGold, avoidGold);
    rmPlaceObjectDefPerPlayer(startGold, false, 2);

    int startBerry = rmCreateObjectDef("frutas iniciais");
    rmAddObjectDefItem(startBerry, "Berry Bush", 2, 4.0);
    rmSetObjectDefMinDistance(startBerry, 14.0);
    rmSetObjectDefMaxDistance(startBerry, 22.0);
    rmAddObjectDefConstraint(startBerry, onLand);
    rmPlaceObjectDefPerPlayer(startBerry, false, 1);

    int startCows = rmCreateObjectDef("rebanho vacas");
    rmAddObjectDefItem(startCows, "Cow", 2, 4.0);
    rmSetObjectDefMinDistance(startCows, 12.0);
    rmSetObjectDefMaxDistance(startCows, 19.0);
    rmAddObjectDefConstraint(startCows, onLand);
    rmPlaceObjectDefPerPlayer(startCows, false, 1);

    int startHunt = rmCreateObjectDef("caca nordica");
    rmAddObjectDefItem(startHunt, "Elk", 3, 6.0);
    rmAddObjectDefItem(startHunt, "Boar", 1, 5.0);
    rmSetObjectDefMinDistance(startHunt, 24.0);
    rmSetObjectDefMaxDistance(startHunt, 42.0);
    rmAddObjectDefConstraint(startHunt, onLand);
    rmPlaceObjectDefPerPlayer(startHunt, false, 1);

    // Assentamentos neutros e Relíquias disputadas
    int settDef = rmCreateObjectDef("assentamento");
    rmAddObjectDefItem(settDef, "Settlement", 1, 0.0);
    rmSetObjectDefMinDistance(settDef, 42.0);
    rmSetObjectDefMaxDistance(settDef, 70.0);
    rmAddObjectDefConstraint(settDef, avoidSettlement);
    rmAddObjectDefConstraint(settDef, avoidLandEdge);
    rmAddObjectDefConstraint(settDef, onLand);
    rmPlaceObjectDefPerPlayer(settDef, false, 2);

    int relicDef = rmCreateObjectDef("reliquia");
    rmAddObjectDefItem(relicDef, "Relic", 1, 0.0);
    rmSetObjectDefMinDistance(relicDef, 48.0);
    rmSetObjectDefMaxDistance(relicDef, 85.0);
    rmAddObjectDefConstraint(relicDef, avoidRelic);
    rmAddObjectDefConstraint(relicDef, onLand);
    rmPlaceObjectDefPerPlayer(relicDef, false, 2);

    int predDef = rmCreateObjectDef("predadores");
    rmAddObjectDefItem(predDef, "Wolf", 2, 6.0);
    rmAddObjectDefItem(predDef, "Bear", 1, 6.0);
    rmPlaceObjectDefInArea(predDef, 0, centerID, 1);

    rmCreateTrigger("IntroAlfheim");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParam("Message", "Alfheim Procedural (RMS AoMR) — Equilíbrio simétrico e bosques nórdicos");
}`;

const MEDITERRANEAN_RMS_XS = `// Mediterrâneo — Mar Central Piscoso & Bases Costeiras
void main(void) {
    int mySize = 2 * sqrt(cNumberNonGaiaPlayers * 8200);
    rmSetMapSize(mySize, mySize);
    rmSetSeaLevel(0);
    rmSetSeaType("Mediterranean Sea");
    rmTerrainInitialize("GrassDirt25", 2.0);

    int classPlayer = rmDefineClass("player");
    int avoidLand = rmCreateTerrainDistanceConstraint("em agua", "land", true, 8.0);
    int onLand = rmCreateTerrainDistanceConstraint("em terra", "land", false, 2.0);
    int avoidEdge = rmCreateBoxConstraint("margem", 0.07, 0.07, 0.93, 0.93);
    int avoidSettlement = rmCreateTypeDistanceConstraint("longe tc", "AbstractSettlement", 32.0);
    int avoidGold = rmCreateTypeDistanceConstraint("longe ouro", "Gold Mine", 24.0);
    int avoidPlayer = rmCreateClassDistanceConstraint("longe base", classPlayer, 20.0);

    // Grande Mar Mediterrâneo no centro
    int seaID = rmCreateArea("mar_central");
    rmSetAreaTerrainType(seaID, "Water");
    rmSetAreaLocation(seaID, 0.5, 0.5);
    rmSetAreaSize(seaID, 0.24, 0.28);
    rmSetAreaBaseHeight(seaID, -2.5);
    rmSetAreaCoherence(seaID, 0.72);
    rmBuildArea(seaID);

    // Jogadores ao redor do litoral
    rmPlacePlayersCircular(0.39, 0.39, 0.03);
    for (int i = 1; i <= cNumberNonGaiaPlayers; i++) {
        int pArea = rmCreateArea("Player" + i);
        rmSetAreaLocPlayer(pArea, i);
        rmSetAreaTerrainType(pArea, "GreekRoadA");
        rmSetAreaBaseHeight(pArea, 2.0);
        rmSetAreaSize(pArea, 0.03, 0.03);
        rmAddAreaToClass(pArea, classPlayer);
        rmBuildArea(pArea);
    }

    // Centros, Ouro, Cabras, Frutas, Bosques e Assentamentos
    int tcDef = rmCreateObjectDef("town center");
    rmAddObjectDefItem(tcDef, "Settlement Level 1", 1, 0.0);
    rmPlaceObjectDefPerPlayer(tcDef, true, 1);

    int goldDef = rmCreateObjectDef("ouro costeiro");
    rmAddObjectDefItem(goldDef, "Gold Mine", 1, 0.0);
    rmSetObjectDefMinDistance(goldDef, 18.0);
    rmSetObjectDefMaxDistance(goldDef, 32.0);
    rmAddObjectDefConstraint(goldDef, onLand);
    rmAddObjectDefConstraint(goldDef, avoidGold);
    rmPlaceObjectDefPerPlayer(goldDef, false, 2);

    int berryDef = rmCreateObjectDef("frutas");
    rmAddObjectDefItem(berryDef, "Berry Bush", 2, 4.0);
    rmSetObjectDefMinDistance(berryDef, 14.0);
    rmSetObjectDefMaxDistance(berryDef, 22.0);
    rmAddObjectDefConstraint(berryDef, onLand);
    rmPlaceObjectDefPerPlayer(berryDef, false, 1);

    int goatDef = rmCreateObjectDef("cabras");
    rmAddObjectDefItem(goatDef, "Goat", 2, 4.0);
    rmAddObjectDefItem(goatDef, "Chicken", 2, 3.0);
    rmSetObjectDefMinDistance(goatDef, 11.0);
    rmSetObjectDefMaxDistance(goatDef, 19.0);
    rmAddObjectDefConstraint(goatDef, onLand);
    rmPlaceObjectDefPerPlayer(goatDef, false, 1);

    int huntDef = rmCreateObjectDef("caca");
    rmAddObjectDefItem(huntDef, "Deer", 3, 5.0);
    rmAddObjectDefItem(huntDef, "Boar", 1, 4.0);
    rmSetObjectDefMinDistance(huntDef, 24.0);
    rmSetObjectDefMaxDistance(huntDef, 40.0);
    rmAddObjectDefConstraint(huntDef, onLand);
    rmPlaceObjectDefPerPlayer(huntDef, false, 1);

    int treeDef = rmCreateObjectDef("bosque oliveiras");
    rmAddObjectDefItem(treeDef, "Oak Tree", 5, 6.0);
    rmSetObjectDefMinDistance(treeDef, 18.0);
    rmSetObjectDefMaxDistance(treeDef, 36.0);
    rmAddObjectDefConstraint(treeDef, onLand);
    rmPlaceObjectDefPerPlayer(treeDef, false, 3);

    int settDef = rmCreateObjectDef("assentamento");
    rmAddObjectDefItem(settDef, "Settlement", 1, 0.0);
    rmSetObjectDefMinDistance(settDef, 38.0);
    rmSetObjectDefMaxDistance(settDef, 68.0);
    rmAddObjectDefConstraint(settDef, onLand);
    rmAddObjectDefConstraint(settDef, avoidSettlement);
    rmAddObjectDefConstraint(settDef, avoidEdge);
    rmPlaceObjectDefPerPlayer(settDef, false, 2);

    // Cardumes e Vida Marinha no Mar Central
    int fishA = rmCreateObjectDef("cardume salmao");
    rmAddObjectDefItem(fishA, "Fish - Salmon", 1, 4.0);
    rmAddObjectDefConstraint(fishA, avoidLand);
    rmPlaceObjectDefInArea(fishA, 0, seaID, cNumberNonGaiaPlayers * 2);

    int fishB = rmCreateObjectDef("cardume mahi");
    rmAddObjectDefItem(fishB, "Fish - Mahi", 1, 4.0);
    rmAddObjectDefConstraint(fishB, avoidLand);
    rmPlaceObjectDefInArea(fishB, 0, seaID, cNumberNonGaiaPlayers * 2);

    int marine = rmCreateObjectDef("golfinhos");
    rmAddObjectDefItem(marine, "Dolphin", 1, 4.0);
    rmAddObjectDefItem(marine, "Whale", 1, 6.0);
    rmAddObjectDefConstraint(marine, avoidLand);
    rmPlaceObjectDefInArea(marine, 0, seaID, 2);

    int relicDef = rmCreateObjectDef("reliquia");
    rmAddObjectDefItem(relicDef, "Relic", 1, 0.0);
    rmSetObjectDefMinDistance(relicDef, 45.0);
    rmSetObjectDefMaxDistance(relicDef, 75.0);
    rmAddObjectDefConstraint(relicDef, onLand);
    rmAddObjectDefConstraint(relicDef, avoidPlayer);
    rmPlaceObjectDefPerPlayer(relicDef, false, 2);

    rmCreateTrigger("IntroMed");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParam("Message", "Mediterrâneo Procedural — Domine a pesca no mar central e proteja sua costa!");
}`;

const VALLEY_KINGS_RMS_XS = `// Vale dos Reis — Cânion Dourado Egípcio com Guardiões Selvagens
void main(void) {
    int mySize = 2 * sqrt(cNumberNonGaiaPlayers * 8000);
    rmSetMapSize(mySize, mySize);
    rmSetSeaLevel(0);
    rmSetSeaType("Red Sea");
    rmTerrainInitialize("SandD", 2.0);

    int classPlayer = rmDefineClass("player");
    int onLand = rmCreateTerrainDistanceConstraint("terra", "land", false, 1.0);
    int avoidGold = rmCreateTypeDistanceConstraint("ouro", "Gold Mine", 20.0);
    int avoidSettlement = rmCreateTypeDistanceConstraint("tc", "AbstractSettlement", 32.0);

    // Vale fértil de palmeiras e ouro rico no centro
    int canyon = rmCreateArea("vale_dourado");
    rmSetAreaTerrainType(canyon, "SandA");
    rmSetAreaLocation(canyon, 0.5, 0.5);
    rmSetAreaSize(canyon, 0.16, 0.20);
    rmSetAreaBaseHeight(canyon, 1.6);
    rmSetAreaCoherence(canyon, 0.65);
    rmBuildArea(canyon);

    // Dunas laterais elevadas
    int duneNW = rmCreateArea("duna_noroeste");
    rmSetAreaTerrainType(duneNW, "SandCliff");
    rmSetAreaLocation(duneNW, 0.22, 0.22);
    rmSetAreaSize(duneNW, 0.08, 0.10);
    rmSetAreaBaseHeight(duneNW, 4.8);
    rmBuildArea(duneNW);

    int duneSE = rmCreateArea("duna_sudeste");
    rmSetAreaTerrainType(duneSE, "SandCliff");
    rmSetAreaLocation(duneSE, 0.78, 0.78);
    rmSetAreaSize(duneSE, 0.08, 0.10);
    rmSetAreaBaseHeight(duneSE, 4.8);
    rmBuildArea(duneSE);

    rmPlacePlayersCircular(0.37, 0.37, 0.02);
    for (int i = 1; i <= cNumberNonGaiaPlayers; i++) {
        int pArea = rmCreateArea("Player" + i);
        rmSetAreaLocPlayer(pArea, i);
        rmSetAreaTerrainType(pArea, "EgyptianRoadA");
        rmSetAreaSize(pArea, 0.03, 0.03);
        rmSetAreaBaseHeight(pArea, 2.0);
        rmAddAreaToClass(pArea, classPlayer);
        rmBuildArea(pArea);
    }

    int tcDef = rmCreateObjectDef("town center");
    rmAddObjectDefItem(tcDef, "Settlement Level 1", 1, 0.0);
    rmPlaceObjectDefPerPlayer(tcDef, true, 1);

    // Minas ricas no vale central + guardiões
    int richGold = rmCreateObjectDef("ouro imperial");
    rmAddObjectDefItem(richGold, "Gold Mine Large", 1, 0.0);
    rmAddObjectDefConstraint(richGold, avoidGold);
    rmPlaceObjectDefInArea(richGold, 0, canyon, cNumberNonGaiaPlayers * 2 + 2);

    int guardians = rmCreateObjectDef("guardioes");
    rmAddObjectDefItem(guardians, "Lion", 2, 5.0);
    rmAddObjectDefItem(guardians, "Hyena", 2, 5.0);
    rmAddObjectDefItem(guardians, "Crocodile", 1, 5.0);
    rmPlaceObjectDefInArea(guardians, 0, canyon, 2);

    int palms = rmCreateObjectDef("palmeiral");
    rmAddObjectDefItem(palms, "Palm", 5, 6.0);
    rmSetObjectDefMinDistance(palms, 16.0);
    rmSetObjectDefMaxDistance(palms, 34.0);
    rmAddObjectDefConstraint(palms, onLand);
    rmPlaceObjectDefPerPlayer(palms, false, 3);

    int goats = rmCreateObjectDef("cabras deserto");
    rmAddObjectDefItem(goats, "Goat", 3, 4.0);
    rmAddObjectDefItem(goats, "Gazelle", 3, 5.0);
    rmSetObjectDefMinDistance(goats, 14.0);
    rmSetObjectDefMaxDistance(goats, 28.0);
    rmAddObjectDefConstraint(goats, onLand);
    rmPlaceObjectDefPerPlayer(goats, false, 1);

    int startGold = rmCreateObjectDef("ouro base");
    rmAddObjectDefItem(startGold, "Gold Mine", 1, 0.0);
    rmSetObjectDefMinDistance(startGold, 16.0);
    rmSetObjectDefMaxDistance(startGold, 25.0);
    rmAddObjectDefConstraint(startGold, avoidGold);
    rmPlaceObjectDefPerPlayer(startGold, false, 1);

    int settDef = rmCreateObjectDef("assentamento");
    rmAddObjectDefItem(settDef, "Settlement", 1, 0.0);
    rmSetObjectDefMinDistance(settDef, 36.0);
    rmSetObjectDefMaxDistance(settDef, 62.0);
    rmAddObjectDefConstraint(settDef, avoidSettlement);
    rmPlaceObjectDefPerPlayer(settDef, false, 2);

    int relicDef = rmCreateObjectDef("reliquias vale");
    rmAddObjectDefItem(relicDef, "Relic", 1, 0.0);
    rmPlaceObjectDefInArea(relicDef, 0, canyon, 3);

    rmCreateTrigger("IntroValley");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParam("Message", "Vale dos Reis Procedural — Conquiste as minas imperiais no cânion central!");
}`;

const ARCHIPELAGO_6V6_RMS_XS = `// Arquipélago 6x6 — Ilhas Individuais + Pontes para Continente Central
void main(void) {
    int mySize = 2 * sqrt(cNumberNonGaiaPlayers * 9200);
    rmSetMapSize(mySize, mySize);
    rmSetSeaLevel(0);
    rmSetSeaType("Tropical Sea");
    rmTerrainInitialize("water", -2.0);

    int classPlayer = rmDefineClass("player");
    int onLand = rmCreateTerrainDistanceConstraint("em terra", "land", false, 1.0);
    int inWater = rmCreateTerrainDistanceConstraint("em agua", "land", true, 9.0);
    int avoidSettlement = rmCreateTypeDistanceConstraint("longe tc", "AbstractSettlement", 28.0);
    int avoidGold = rmCreateTypeDistanceConstraint("longe ouro", "Gold Mine", 22.0);

    // Continente central rico
    int centerIsland = rmCreateArea("continente_central");
    rmSetAreaTerrainType(centerIsland, "JungleGrass");
    rmSetAreaLocation(centerIsland, 0.5, 0.5);
    rmSetAreaSize(centerIsland, 0.20, 0.24);
    rmSetAreaBaseHeight(centerIsland, 2.2);
    rmSetAreaCoherence(centerIsland, 0.78);
    rmBuildArea(centerIsland);

    // Jogadores em anel externo (suporta de 2 até 12 jogadores / 6x6)
    rmPlacePlayersCircular(0.41, 0.41, 0.0);
    for (int i = 1; i <= cNumberNonGaiaPlayers; i++) {
        int isle = rmCreateArea("Player" + i);
        rmSetAreaLocPlayer(isle, i);
        rmSetAreaTerrainType(isle, "GrassDirt25");
        rmSetAreaSize(isle, 0.045, 0.045);
        rmSetAreaBaseHeight(isle, 2.0);
        rmSetAreaCoherence(isle, 0.85);
        rmAddAreaToClass(isle, classPlayer);
        rmBuildArea(isle);

        // Ponte terrestre ligando cada ilha ao continente central
        int bridge = rmCreateConnection("ponte_" + i);
        rmSetConnectionType(bridge, cConnectAreas, true, 100);
        rmAddConnectionArea(bridge, isle);
        rmAddConnectionArea(bridge, centerIsland);
        rmSetConnectionWidth(bridge, 11.0, 0.0);
        rmSetConnectionBaseHeight(bridge, 2.0);
        rmBuildConnection(bridge);
    }

    int tcDef = rmCreateObjectDef("town center");
    rmAddObjectDefItem(tcDef, "Settlement Level 1", 1, 0.0);
    rmPlaceObjectDefPerPlayer(tcDef, true, 1);

    int baseGold = rmCreateObjectDef("ouro ilha");
    rmAddObjectDefItem(baseGold, "Gold Mine", 1, 0.0);
    rmSetObjectDefMinDistance(baseGold, 14.0);
    rmSetObjectDefMaxDistance(baseGold, 22.0);
    rmAddObjectDefConstraint(baseGold, onLand);
    rmAddObjectDefConstraint(baseGold, avoidGold);
    rmPlaceObjectDefPerPlayer(baseGold, false, 1);

    int baseFood = rmCreateObjectDef("fauna ilha");
    rmAddObjectDefItem(baseFood, "Pig", 2, 4.0);
    rmAddObjectDefItem(baseFood, "Berry Bush", 2, 4.0);
    rmSetObjectDefMinDistance(baseFood, 11.0);
    rmSetObjectDefMaxDistance(baseFood, 20.0);
    rmAddObjectDefConstraint(baseFood, onLand);
    rmPlaceObjectDefPerPlayer(baseFood, false, 1);

    int baseWood = rmCreateObjectDef("palmeiras ilha");
    rmAddObjectDefItem(baseWood, "Palm", 5, 5.0);
    rmSetObjectDefMinDistance(baseWood, 15.0);
    rmSetObjectDefMaxDistance(baseWood, 24.0);
    rmAddObjectDefConstraint(baseWood, onLand);
    rmPlaceObjectDefPerPlayer(baseWood, false, 2);

    // Continente central: Assentamentos, Ouro Grande, Relíquias e Caça
    int midSett = rmCreateObjectDef("assentamento central");
    rmAddObjectDefItem(midSett, "Settlement", 1, 0.0);
    rmAddObjectDefConstraint(midSett, avoidSettlement);
    rmPlaceObjectDefInArea(midSett, 0, centerIsland, cNumberNonGaiaPlayers + 2);

    int midGold = rmCreateObjectDef("ouro central");
    rmAddObjectDefItem(midGold, "Gold Mine Large", 1, 0.0);
    rmAddObjectDefConstraint(midGold, avoidGold);
    rmPlaceObjectDefInArea(midGold, 0, centerIsland, cNumberNonGaiaPlayers + 2);

    int midRelic = rmCreateObjectDef("reliquias centrais");
    rmAddObjectDefItem(midRelic, "Relic", 1, 0.0);
    rmPlaceObjectDefInArea(midRelic, 0, centerIsland, 4);

    int midHunt = rmCreateObjectDef("caca tropical");
    rmAddObjectDefItem(midHunt, "Capybara", 2, 5.0);
    rmAddObjectDefItem(midHunt, "Tiger", 1, 6.0);
    rmAddObjectDefItem(midHunt, "Boar", 2, 5.0);
    rmPlaceObjectDefInArea(midHunt, 0, centerIsland, 2);

    int fish = rmCreateObjectDef("cardumes oceano");
    rmAddObjectDefItem(fish, "Fish - Mahi", 1, 5.0);
    rmAddObjectDefConstraint(fish, inWater);
    rmSetObjectDefMinDistance(fish, 24.0);
    rmSetObjectDefMaxDistance(fish, 75.0);
    rmPlaceObjectDefPerPlayer(fish, false, 2);

    int turtles = rmCreateObjectDef("tartarugas");
    rmAddObjectDefItem(turtles, "Sea Turtle", 1, 4.0);
    rmAddObjectDefConstraint(turtles, inWater);
    rmSetObjectDefMinDistance(turtles, 28.0);
    rmSetObjectDefMaxDistance(turtles, 75.0);
    rmPlaceObjectDefPerPlayer(turtles, false, 1);

    rmCreateTrigger("IntroArch");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParam("Message", "Arquipélago 6x6 Procedural — Atravesse as pontes costeiras e conquiste o continente central!");
}`;

const makeXml = (details: string, name: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<mapinfo details="${details}" imagepath="ui\\ui map scenario 256x256" displayNameID="${name}" cannotReplace=""/>`;

export const RMS_SCRIPT_LIBRARY: RmsScriptTemplate[] = [
  {
    id: 'total_war_xs',
    name: 'Total War I (.xs Real)',
    subtitle: 'Executa o arquivo Total War I.xs e Total War I.xml originais com ilhas, pontes, clima duplo e gatilhos',
    sourceLabel: 'Arquivo Real .xs + .xml',
    recommendedPlayers: 4,
    xsCode: totalWarXsRaw,
    xmlCode: totalWarXmlRaw,
  },
  {
    id: 'alfheim_rms',
    name: 'Alfheim (Clássico AoMR)',
    subtitle: 'Modelo inspirado no guia de AoM: Retold — bases circulares, estradas, colinas, bosques e caça balanceada',
    sourceLabel: 'Modelo AoMR',
    recommendedPlayers: 2,
    xsCode: ALFHEIM_RMS_XS,
    xmlCode: makeXml('Bosques nórdicos simétricos com colinas centrais, estradas e caça equilibrada.', 'Alfheim RMS'),
  },
  {
    id: 'mediterranean_rms',
    name: 'Mediterrâneo (Mar Central)',
    subtitle: 'Grande mar interior rico em cardumes e vida marinha cercado por bases costeiras',
    sourceLabel: 'Modelo AoMR',
    recommendedPlayers: 4,
    xsCode: MEDITERRANEAN_RMS_XS,
    xmlCode: makeXml('Mar Mediterrâneo central piscoso cercado por litorais férteis e relíquias.', 'Mediterrâneo RMS'),
  },
  {
    id: 'valley_kings_rms',
    name: 'Vale dos Reis (Cânion Dourado)',
    subtitle: 'Deserto egípcio com minas de ouro imperiais no vale central guardadas por feras selvagens',
    sourceLabel: 'Modelo AoMR',
    recommendedPlayers: 2,
    xsCode: VALLEY_KINGS_RMS_XS,
    xmlCode: makeXml('Cânion egípcio com minas de ouro abundantes no centro e dunas elevadas.', 'Vale dos Reis RMS'),
  },
  {
    id: 'archipelago_6v6_rms',
    name: 'Arquipélago 6x6 (Ilhas & Pontes)',
    subtitle: 'Suporta de 2 a 12 jogadores em anel de ilhas ligadas por pontes ao continente central',
    sourceLabel: 'Modelo 6x6',
    recommendedPlayers: 8,
    xsCode: ARCHIPELAGO_6V6_RMS_XS,
    xmlCode: makeXml('Ilhas individuais conectadas por pontes costeiras a um continente central rico.', 'Arquipélago 6x6 RMS'),
  },
  {
    id: 'magma_cliffs_rocks_rms',
    name: 'Fissura de Magma & Penhascos (.xs)',
    subtitle: 'Demonstra as 4 camadas: EgyptianDirtA, rio de HadesLava intransponível, NorseCliff, Rock Granite Small e emissores FX',
    sourceLabel: 'Camadas AoMR',
    recommendedPlayers: 2,
    xsCode: `// Fissura de Magma, Penhascos e Rochas — AoM: Retold 4-Layer Terrain Script (.xs)
void main(void) {
    // Define o tamanho do mapa (em tiles)
    rmSetMapSize(300, 300);

    // 1. Preenche o mapa base com poeira/terra seca
    rmTerrainInitialize("EgyptianDirtA", 1.5);

    // Posiciona jogadores em anel seguro ao redor da fissura
    rmPlacePlayersCircular(0.36, 0.36, 0.0);

    // 2. Cria uma área central de magma/lava intransponível
    int lavaID = rmCreateArea("rio_de_magma");
    rmSetAreaSize(lavaID, 0.15, 0.20);
    rmSetAreaLocation(lavaID, 0.5, 0.5);
    rmSetAreaTerrainType(lavaID, "HadesLava");
    rmSetAreaBaseHeight(lavaID, -1.2);
    rmBuildArea(lavaID);

    // 3. Cria penhascos rochosos elevados (NorseCliff + HadesCliff)
    int cliffID = rmCreateArea("montanha_rochosa");
    rmSetAreaSize(cliffID, 0.10, 0.12);
    rmSetAreaLocation(cliffID, 0.25, 0.75);
    rmSetAreaCliffType(cliffID, "NorseCliff");
    rmSetAreaBaseHeight(cliffID, 4.0);
    rmBuildArea(cliffID);

    int cliff2ID = rmCreateArea("escarpa_hades");
    rmSetAreaSize(cliff2ID, 0.08, 0.11);
    rmSetAreaLocation(cliff2ID, 0.75, 0.25);
    rmSetAreaCliffType(cliff2ID, "HadesCliff");
    rmSetAreaBaseHeight(cliff2ID, 4.2);
    rmBuildArea(cliff2ID);

    // 4. Espalha rochas decorativas (sem colisão), pilares bloqueadores e emissores FX
    int rockObjID = rmCreateObjectDef("rochas_decorativas");
    rmAddObjectDefItem(rockObjID, "Rock Granite Small", 5, 4.0);
    rmPlaceObjectDefAtLoc(rockObjID, 0, 0.3, 0.3, 10);

    int basaltID = rmCreateObjectDef("pilares_basalto");
    rmAddObjectDefItem(basaltID, "Basalt Pillar", 2, 3.0);
    rmAddObjectDefItem(basaltID, "Stalagmite", 2, 3.5);
    rmPlaceObjectDefAtLoc(basaltID, 0, 0.5, 0.5, 6);

    int fxID = rmCreateObjectDef("emissores_vulcanicos");
    rmAddObjectDefItem(fxID, "FX Magma Sparks", 2, 4.0);
    rmAddObjectDefItem(fxID, "FX Volcanic Smoke", 2, 4.5);
    rmPlaceObjectDefAtLoc(fxID, 0, 0.5, 0.5, 4);

    // Recursos estratégicos próximos aos jogadores
    int goldID = rmCreateObjectDef("ouro_inicial");
    rmAddObjectDefItem(goldID, "Gold Mine Large", 1, 2.0);
    rmSetObjectDefMinDistance(goldID, 12.0);
    rmSetObjectDefMaxDistance(goldID, 20.0);
    rmPlaceObjectDefPerPlayer(goldID, false, 2);

    rmCreateTrigger("IntroMagma");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParam("Message", "Fissura de Magma & Penhascos — Domine as encostas rochosas e evite o rio de HadesLava!");
}`,
    xmlCode: makeXml('Terreno árido cortado por rio de HadesLava, penhascos NorseCliff, rochas 3D e partículas vulcânicas.', 'Fissura de Magma RMS'),
  },
];

export function compileRmsScript(options: {
  xsCode: string;
  xmlCode?: string;
  seed: number;
  worldSize: WorldSizeId;
  playerCount: number;
  scriptId?: string;
  title?: string;
}): RmsCompileResult {
  const xmlMeta = parseMapXml(options.xmlCode);
  const ctx = new RmsBuilderContext(options.seed, options.worldSize, options.playerCount);
  let syntaxError: { line: number; message: string } | undefined;

  try {
    const tokens = tokenizeXs(options.xsCode);
    const parser = new XsParser(tokens);
    const ast = parser.parseProgram();
    const evaluator = new XsEvaluator(ctx);
    evaluator.run(ast);
  } catch (err) {
    if (err instanceof XsSyntaxError) {
      syntaxError = { line: err.line, message: err.message };
      ctx.log('error', `Linha ${err.line}`, err.message);
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      syntaxError = { line: 1, message: msg };
      ctx.log('error', 'Runtime', msg);
    }
  }

  const map = ctx.finalize(
    options.scriptId ?? 'custom_xs',
    options.title || xmlMeta.displayNameID || 'Mapa Procedural (.xs)'
  );

  return { map, xmlMeta, syntaxError };
}
