// Auto-converted from lightning storm.xmb (Age of Mythology XMB God Power Definition)
export const lightningStormPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "LightningStorm",
    "techname": "lightning storm",
    "type": "lightning"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "LightningBirth"
      },
      "value": "1.3"
    },
    {
      "tag": "activetime",
      "value": "15.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "45.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Greek SFX"
    },
    {
      "tag": "powerblocker",
      "value": "45.0f"
    },
    {
      "tag": "reveallos",
      "attributes": {
        "radius": "30.0"
      },
      "value": "Revealer To Player"
    },
    {
      "tag": "unitaitype",
      "value": "HandUnitsAttack"
    },
    {
      "tag": "radius",
      "value": "45.0"
    },
    {
      "tag": "accuracy",
      "value": "0.66"
    },
    {
      "tag": "strikesoundset",
      "value": "LightningStrike"
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
        "listenertype": "IfOnScreenAll",
        "type": "StartSound"
      },
      "value": "LightThunder"
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
          "value": "0.50"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.50"
        },
        {
          "tag": "minhpdamageunit",
          "value": "2200"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "600"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "300"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "5500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "800"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "800"
        }
      ]
    },
    {
      "tag": "strike",
      "value": "lightning strike"
    },
    {
      "tag": "sparks",
      "value": "lightning sparks"
    },
    {
      "tag": "groundsparks",
      "value": "lightning sparks ground"
    },
    {
      "tag": "scorch",
      "value": "lightning scorch"
    },
    {
      "tag": "cloud",
      "value": "lightning cloud"
    },
    {
      "tag": "rain",
      "value": "lightning rain"
    },
    {
      "tag": "fasteststriketime",
      "value": "0.10"
    },
    {
      "tag": "sloweststriketime",
      "value": "0.20"
    },
    {
      "tag": "strikeheight",
      "value": "25.0"
    },
    {
      "tag": "strikeminoffset",
      "value": "2.0"
    },
    {
      "tag": "strikemaxoffset",
      "value": "5.0"
    },
    {
      "tag": "cloudbuildupendtime",
      "value": "1.0"
    },
    {
      "tag": "cloudfadeoutstarttime",
      "value": "40.0"
    },
    {
      "tag": "cloudfadeoutendtime",
      "value": "43.0"
    },
    {
      "tag": "rainbuildupstarttime",
      "value": "2.0"
    },
    {
      "tag": "rainbuildupendtime",
      "value": "7.0"
    },
    {
      "tag": "rainfadeoutstarttime",
      "value": "37.0"
    },
    {
      "tag": "rainfadeoutendtime",
      "value": "38.0"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "unit"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "building"
    },
    {
      "tag": "icon",
      "value": "god power lightning icon"
    },
    {
      "tag": "usedicon",
      "value": "god power lightning icon done"
    }
  ]
} as const;
export default lightningStormPowerXmb;
