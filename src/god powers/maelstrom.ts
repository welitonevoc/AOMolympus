// Auto-converted from maelstrom.xmb (Age of Mythology XMB God Power Definition)
// Poseidon / Njord — Maelstrom: creates a devastating ocean vortex (naval + coastal)
export const maelstromPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Maelstrom",
    "techname": "maelstrom",
    "type": "maelstrom"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "MaelstromBirth"
      },
      "value": "2.0"
    },
    {
      "tag": "activetime",
      "value": "20.0"
    },
    {
      "tag": "shutdowntime",
      "attributes": {
        "soundset": "MaelstromDeath"
      },
      "value": "1.0"
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
      "tag": "maelstromsfx",
      "value": "Ocean Maelstrom SFX"
    },
    {
      "tag": "waterspout",
      "value": "Maelstrom Water Vortex"
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
          "value": "0.80"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.60"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.65"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1600"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "700"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "5500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "4500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "1800"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "11000"
        }
      ]
    },
    {
      "tag": "bonusvssea",
      "value": "2.5"
    },
    {
      "tag": "minthrowdistance",
      "value": "5.0"
    },
    {
      "tag": "maxthrowdistance",
      "value": "12.0"
    },
    {
      "tag": "minthrowheight",
      "value": "5.0"
    },
    {
      "tag": "maxthrowheight",
      "value": "10.0"
    },
    {
      "tag": "minthrowvelocity",
      "value": "8.0"
    },
    {
      "tag": "maxthrowvelocity",
      "value": "16.0"
    },
    {
      "tag": "xzvelocity",
      "value": "5.5"
    },
    {
      "tag": "angularvelocity",
      "value": "4.0"
    },
    {
      "tag": "funnelradius",
      "value": "6.0"
    },
    {
      "tag": "funnelheight",
      "value": "12.0"
    },
    {
      "tag": "minimapeventtime",
      "value": "20.0"
    },
    {
      "tag": "camerashake",
      "attributes": {
        "duration": "1.0",
        "strength": "0.35"
      }
    },
    {
      "tag": "powerblocker",
      "value": "30.0f"
    },
    {
      "tag": "icon",
      "value": "god power maelstrom icon"
    },
    {
      "tag": "usedicon",
      "value": "god power maelstrom icon done"
    }
  ]
} as const;
export default maelstromPowerXmb;
