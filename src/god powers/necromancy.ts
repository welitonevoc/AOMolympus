// Auto-converted from necromancy.xmb (Age of Mythology XMB God Power Definition)
// Néftis (Egyptian Age 3) & Prometeu (Atlantean Age 2) — Necromância: raises slain units as undead soldiers
export const necromancyPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Necromancy",
    "techname": "necromancy",
    "type": "necromancy"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "1.5"
    },
    {
      "tag": "activetime",
      "value": "0.5"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "radius",
      "value": "16.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "NecromancyStart"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "EndSound"
      },
      "value": "GodPowerEnd"
    },
    {
      "tag": "undeadsfx",
      "value": "Necromancy Rise SFX"
    },
    {
      "tag": "undeadgraph",
      "value": "Undead Rising VFX"
    },
    {
      "tag": "maxraisedunits",
      "value": "12"
    },
    {
      "tag": "raisedunitduration",
      "value": "55.0"
    },
    {
      "tag": "raisedunithpmult",
      "value": "0.65"
    },
    {
      "tag": "raisedunitattackmult",
      "value": "0.75"
    },
    {
      "tag": "playerrelation",
      "value": "enemy"
    },
    {
      "tag": "eligibleunittypes",
      "value": "LogicalTypeLand"
    },
    {
      "tag": "minhptorevive",
      "value": "0.0"
    },
    {
      "tag": "maxhptorevive",
      "value": "0.0"
    },
    {
      "tag": "powerblocker",
      "value": "30.0f"
    },
    {
      "tag": "icon",
      "value": "god power necromancy icon"
    },
    {
      "tag": "usedicon",
      "value": "god power necromancy icon done"
    }
  ]
} as const;
export default necromancyPowerXmb;
