// Auto-converted from chaos.xmb (Age of Mythology XMB God Power Definition)
export const chaosPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Chaos",
    "techname": "Chaos",
    "type": "chaos"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "-1"
    },
    {
      "tag": "radius",
      "value": "20.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "8",
        "radius": "20.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Atlantean SFX"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "Caster",
        "type": "StartSound"
      },
      "value": "Chaos"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "AllExceptCaster",
        "type": "StartSound"
      },
      "value": "GodPowerStart"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "convertusingminmax",
      "attributes": {
        "maxswapamount": "3",
        "minswapamount": "3"
      },
      "value": "normal"
    },
    {
      "tag": "convertusingminmax",
      "attributes": {
        "maxswapamount": "1",
        "minswapamount": "1"
      },
      "value": "myth"
    },
    {
      "tag": "powerplayerrelation",
      "value": "enemy"
    },
    {
      "tag": "swapdelay",
      "value": "0.5"
    },
    {
      "tag": "swapenemyonly"
    },
    {
      "tag": "attachproto",
      "value": "Chaos effect"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeAffectedByChaos"
    },
    {
      "tag": "recharges",
      "value": "1"
    },
    {
      "tag": "rechargetime",
      "value": "260"
    }
  ]
} as const;
export default chaosPowerXmb;
