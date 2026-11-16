// Auto-converted from tremor.xmb (Age of Mythology XMB God Power Definition)
export const tremorPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Tremor",
    "techname": "Tremor",
    "type": "Tremor"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "-1"
    },
    {
      "tag": "radius",
      "value": "5.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "3",
        "radius": "5.0",
        "speed": "0.3"
      },
      "value": "UI Range Indicator Atlantean SFX"
    },
    {
      "tag": "stunlength",
      "value": "2.0"
    },
    {
      "tag": "rumbleheight",
      "value": "1.2"
    },
    {
      "tag": "rumblewidth",
      "value": "1.0"
    },
    {
      "tag": "rumblespeed",
      "value": "25.0"
    },
    {
      "tag": "rumblefadetime",
      "value": "0.2"
    },
    {
      "tag": "minthrowdistance",
      "value": "7"
    },
    {
      "tag": "maxthrowdistance",
      "value": "9"
    },
    {
      "tag": "minthrowheight",
      "value": "1"
    },
    {
      "tag": "maxthrowheight",
      "value": "2.0"
    },
    {
      "tag": "minthrowvelocity",
      "value": "12"
    },
    {
      "tag": "maxthrowvelocity",
      "value": "13"
    },
    {
      "tag": "attackproto",
      "value": "Tremor"
    },
    {
      "tag": "attackinterval",
      "value": "0.25"
    },
    {
      "tag": "attacktreeaccuracy",
      "value": "0.25"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidTremorAttack"
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
          "value": "1.0"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.30"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.20"
        },
        {
          "tag": "minhpdamageunit",
          "value": "800"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "100"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "9500"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "1500"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "100"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "12000"
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
          "value": "0.0"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.0"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.0"
        },
        {
          "tag": "minhpdamageunit",
          "value": "0"
        },
        {
          "tag": "minhpdamagevillager",
          "value": "0"
        },
        {
          "tag": "minhpdamagebuilding",
          "value": "0"
        },
        {
          "tag": "maxhpdamageunit",
          "value": "0"
        },
        {
          "tag": "maxhpdamagevillager",
          "value": "0"
        },
        {
          "tag": "maxhpdamagebuilding",
          "value": "0"
        }
      ]
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "IfOnScreenAll",
        "type": "StartSound"
      },
      "value": "shockwave"
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
      "tag": "camerashake",
      "attributes": {
        "duration": "0.10",
        "strength": "0.10"
      }
    },
    {
      "tag": "reveallos",
      "attributes": {
        "radius": "5.0"
      },
      "value": "Revealer To Player"
    },
    {
      "tag": "unitaitype",
      "value": "Earthquake"
    },
    {
      "tag": "recharges",
      "value": "2"
    },
    {
      "tag": "rechargetime",
      "value": "260"
    }
  ]
} as const;
export default tremorPowerXmb;
