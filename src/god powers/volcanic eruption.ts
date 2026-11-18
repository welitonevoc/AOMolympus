// Auto-converted from volcanic eruption.xmb (Age of Mythology XMB God Power Definition)
// Hefesto (Greek Age 4) & Vidar (Norse Age 4) — Erupção Vulcânica
export const volcanicEruptionPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Volcanic Eruption",
    "techname": "volcanic_eruption",
    "type": "volcanic_eruption"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "VolcanoRumble"
      },
      "value": "2.5"
    },
    {
      "tag": "activetime",
      "value": "22.0"
    },
    {
      "tag": "shutdowntime",
      "attributes": {
        "soundset": "VolcanoEnd"
      },
      "value": "1.5"
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
      "value": "20.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "GodPowerStart"
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
      "tag": "eruptionsfx",
      "value": "Volcano Eruption Impact"
    },
    {
      "tag": "lavaflow",
      "value": "Lava Flow SFX"
    },
    {
      "tag": "playsbattlemusic"
    },
    {
      "tag": "gpdamagemodel",
      "children": [
        {
          "tag": "playerrelation",
          "value": "enemy"
        },
        {
          "tag": "basedamagepercentunit",
          "value": "0.65"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.65"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "1.0"
        },
        {
          "tag": "minhpdamageunit",
          "value": "2000"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "900"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "7500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "5500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "2200"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "15000"
        }
      ]
    },
    {
      "tag": "gpdamagemodel",
      "children": [
        {
          "tag": "playerrelation",
          "value": "ally"
        },
        {
          "tag": "basedamagepercentunit",
          "value": "0.1"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.1"
        },
        {
          "tag": "minhpdamageunit",
          "value": "200"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "500"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "1200"
        }
      ]
    },
    {
      "tag": "bouldercount",
      "value": "12"
    },
    {
      "tag": "lavapoolradius",
      "value": "4.5"
    },
    {
      "tag": "lavalifttime",
      "value": "0.75"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "1.5",
        "strength": "0.55"
      }
    },
    {
      "tag": "powerblocker",
      "value": "40.0f"
    },
    {
      "tag": "icon",
      "value": "god power volcanic eruption icon"
    },
    {
      "tag": "usedicon",
      "value": "god power volcanic eruption icon done"
    }
  ]
} as const;
export default volcanicEruptionPowerXmb;
