// Auto-converted from prosperity.xmb (Age of Mythology XMB God Power Definition)
// Afrodite (Greek Age 3), Deméter (Greek), Ísis (Egyptian) — Prosperidade
export const prosperityPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Prosperity",
    "techname": "prosperity",
    "type": "prosperity"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "0.5"
    },
    {
      "tag": "activetime",
      "value": "30.0"
    },
    {
      "tag": "placement",
      "value": "self"
    },
    {
      "tag": "radius",
      "value": "0.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "ProsperityStart"
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
      "tag": "goldperinterval",
      "value": "20.0"
    },
    {
      "tag": "foodperinterval",
      "value": "15.0"
    },
    {
      "tag": "woodperinterval",
      "value": "12.0"
    },
    {
      "tag": "favorperinterval",
      "value": "4.0"
    },
    {
      "tag": "interval",
      "value": "2.5"
    },
    {
      "tag": "playerrelation",
      "value": "self"
    },
    {
      "tag": "glowgraph",
      "value": "Prosperity Aura SFX"
    },
    {
      "tag": "powerblocker",
      "value": "0.0f"
    },
    {
      "tag": "icon",
      "value": "god power prosperity icon"
    },
    {
      "tag": "usedicon",
      "value": "god power prosperity icon done"
    }
  ]
} as const;
export default prosperityPowerXmb;
