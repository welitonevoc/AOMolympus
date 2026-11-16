// Auto-converted from tornado.xmb (Age of Mythology XMB God Power Definition)
export const tornadoPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Tornado",
    "techname": "Tornado",
    "type": "tornado"
  },
  "children": [
    {
      "tag": "builduptime",
      "attributes": {
        "soundset": "TornadoBirth"
      },
      "value": "0.1"
    },
    {
      "tag": "activetime",
      "value": "20.0"
    },
    {
      "tag": "shutdowntime",
      "attributes": {
        "soundset": "TornadoDeath"
      },
      "value": "0.1"
    },
    {
      "tag": "minimapeventtime",
      "value": "20.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "18.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Egypt SFX"
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
      "tag": "playsbattlemusic"
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
      "value": "10.0"
    },
    {
      "tag": "powerblocker",
      "value": "20.0f"
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
          "value": "0.30"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.80"
        },
        {
          "tag": "minhpdamageunit",
          "value": "1500"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "600"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "8000"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "3000"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "1200"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "9000"
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
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.5"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.5"
        },
        {
          "tag": "minhpdamageunit",
          "value": "300"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "300"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "1200"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "900"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "600"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "2400"
        }
      ]
    },
    {
      "tag": "tornadosfx",
      "value": "Tornado"
    },
    {
      "tag": "debris",
      "value": "Tornado Debris"
    },
    {
      "tag": "dirttexture",
      "value": "SFX A Tornado Dirt"
    },
    {
      "tag": "snowtexture",
      "value": "SFX A Tornado Snow"
    },
    {
      "tag": "watertexture",
      "value": "SFX A Tornado Water"
    },
    {
      "tag": "damagetype",
      "value": "LogicalTypeTornadoAttack"
    },
    {
      "tag": "scantime",
      "value": "0.5"
    },
    {
      "tag": "attackgaiaaccuracy",
      "value": "0.5"
    },
    {
      "tag": "minthrowdistance",
      "value": "9.0"
    },
    {
      "tag": "maxthrowdistance",
      "value": "15.0"
    },
    {
      "tag": "minthrowheight",
      "value": "14.0"
    },
    {
      "tag": "maxthrowheight",
      "value": "15.0"
    },
    {
      "tag": "minthrowvelocity",
      "value": "10.0"
    },
    {
      "tag": "maxthrowvelocity",
      "value": "20.0"
    },
    {
      "tag": "dontthrow",
      "value": "Building"
    },
    {
      "tag": "dontthrow",
      "value": "Wood"
    },
    {
      "tag": "dontthrow",
      "value": "Gold"
    },
    {
      "tag": "dontthrow",
      "value": "Fish"
    },
    {
      "tag": "cantsuck",
      "value": "AbstractSettlement"
    },
    {
      "tag": "cantsuck",
      "value": "Farm"
    },
    {
      "tag": "cantsuck",
      "value": "Building"
    },
    {
      "tag": "cantsuck",
      "value": "Gold"
    },
    {
      "tag": "cantsuck",
      "value": "Wave"
    },
    {
      "tag": "numberobjsperbuilding",
      "value": "3"
    },
    {
      "tag": "xzvelocity",
      "value": "6.5"
    },
    {
      "tag": "yvelocity",
      "value": "3.0"
    },
    {
      "tag": "funnelradius",
      "value": "4.5"
    },
    {
      "tag": "funnelheight",
      "value": "16.0"
    },
    {
      "tag": "angularvelocity",
      "value": "3.14"
    },
    {
      "tag": "funnelspeed",
      "value": "3.5"
    },
    {
      "tag": "terrainlogic",
      "children": [
        {
          "tag": "terrainuiclass",
          "value": "Snow"
        },
        {
          "tag": "texture",
          "value": "SFX A Tornado Snow"
        }
      ]
    },
    {
      "tag": "icon",
      "value": "god power tornado icon"
    },
    {
      "tag": "usedicon",
      "value": "god power tornado icon done"
    }
  ]
} as const;
export default tornadoPowerXmb;
