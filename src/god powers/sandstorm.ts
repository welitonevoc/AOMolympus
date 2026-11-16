// Auto-converted from sandstorm.xmb (Age of Mythology XMB God Power Definition)
export const sandstormPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "ShiftingSands",
    "techname": "Sandstorm",
    "type": "sandstorm"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "5"
    },
    {
      "tag": "placementsearchradius",
      "value": "5 "
    },
    {
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "ally"
      },
      "value": "10.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "10.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Egypt SFX"
    },
    {
      "tag": "startsoundset",
      "value": "GodPowerStart"
    },
    {
      "tag": "endsoundset",
      "value": "GodPowerEnd"
    },
    {
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "full"
    },
    {
      "tag": "dualpowermindistance",
      "value": "40.0"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidShiftingSandsTarget"
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
          "value": "0.40"
        },
        {
          "tag": "basedamagepercentvillager",
          "value": "0.25"
        },
        {
          "tag": "basedamagepercentbuilding",
          "value": "0.0"
        },
        {
          "tag": "minhpdamageunit",
          "value": "600"
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
          "value": "4000"
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
      "tag": "inportal",
      "value": "Shifting Sands In"
    },
    {
      "tag": "outportal",
      "value": "Shifting Sands Out"
    },
    {
      "tag": "radius",
      "value": "10.0"
    },
    {
      "tag": "icon",
      "value": "god power shifting sands icon"
    },
    {
      "tag": "usedicon",
      "value": "god power shifting sands icon done"
    }
  ]
} as const;
export default sandstormPowerXmb;
