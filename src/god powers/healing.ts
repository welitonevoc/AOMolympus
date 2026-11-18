// Auto-converted from healing.xmb (Age of Mythology XMB God Power Definition)
// Forseti (Norse Age 2) — Círculo de Cura: heals all friendly units in radius
export const healingPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Healing",
    "techname": "healing",
    "type": "healing"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "1.0"
    },
    {
      "tag": "activetime",
      "value": "12.0"
    },
    {
      "tag": "shutdowntime",
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
      "value": "14.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "HealingStart"
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
      "tag": "healsfx",
      "value": "Forseti Healing Circle SFX"
    },
    {
      "tag": "glowgraph",
      "value": "Norse Healing Glow"
    },
    {
      "tag": "healratepercentunit",
      "value": "0.045"
    },
    {
      "tag": "healratepercentvillager",
      "value": "0.055"
    },
    {
      "tag": "maxhealpercentunit",
      "value": "0.75"
    },
    {
      "tag": "maxhealpercentvillager",
      "value": "0.90"
    },
    {
      "tag": "playerrelation",
      "value": "ally"
    },
    {
      "tag": "powerblocker",
      "value": "0.0f"
    },
    {
      "tag": "icon",
      "value": "god power healing icon"
    },
    {
      "tag": "usedicon",
      "value": "god power healing icon done"
    }
  ]
} as const;
export default healingPowerXmb;
