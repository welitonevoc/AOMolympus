// Auto-converted from blizzard.xmb (Age of Mythology XMB God Power Definition)
// Tyr (Norse Age 4) — Nevasca: blankets an area in deadly freezing storm
export const blizzardPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Blizzard",
    "techname": "blizzard",
    "type": "blizzard"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "BlizzardBirth"
      },
      "value": "1.5"
    },
    {
      "tag": "activetime",
      "value": "25.0"
    },
    {
      "tag": "shutdowntime",
      "attributes": {
        "soundset": "BlizzardDeath"
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
      "value": "16.0"
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
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "EndSound"
      },
      "value": "GodPowerEnd"
    },
    {
      "tag": "blizzardsfx",
      "value": "Blizzard Storm Loop"
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
          "value": "0.60"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.45"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.35"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1200"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "500"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "2500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "3800"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "1500"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "7000"
        }
      ]
    },
    {
      "tag": "slowpercent",
      "value": "0.45"
    },
    {
      "tag": "attackratedebuff",
      "value": "0.35"
    },
    {
      "tag": "scantime",
      "value": "1.0"
    },
    {
      "tag": "minimapeventtime",
      "value": "25.0"
    },
    {
      "tag": "powerblocker",
      "value": "35.0f"
    },
    {
      "tag": "icon",
      "value": "god power blizzard icon"
    },
    {
      "tag": "usedicon",
      "value": "god power blizzard icon done"
    }
  ]
} as const;
export default blizzardPowerXmb;
