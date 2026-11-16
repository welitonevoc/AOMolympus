// Auto-converted from frost.xmb (Age of Mythology XMB God Power Definition)
export const frostPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Frost",
    "techname": "frost",
    "type": "frost"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "50.0"
    },
    {
      "tag": "unitaitype",
      "value": "HandCombative"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "20.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Norse SFX"
    },
    {
      "tag": "radius",
      "value": "24.0"
    },
    {
      "tag": "accuracy",
      "value": "1"
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
      "value": "IceStereo"
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
      "tag": "storm",
      "value": "ice sheet"
    },
    {
      "tag": "drift",
      "value": "frost drift"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidFrostTarget"
    },
    {
      "tag": "fastestfreezetime",
      "value": "0.5"
    },
    {
      "tag": "slowestfreezetime",
      "value": "1.0"
    },
    {
      "tag": "freezeexpansiontime",
      "value": "3.0"
    },
    {
      "tag": "freezeholdtime",
      "value": "45.0"
    },
    {
      "tag": "freezetransitiontime",
      "value": "1.5"
    },
    {
      "tag": "fastestdrifttime",
      "value": "4.0"
    },
    {
      "tag": "slowestdrifttime",
      "value": "8.0"
    },
    {
      "tag": "armor",
      "children": [
        {
          "tag": "abstracttype",
          "value": "Unit"
        },
        {
          "tag": "armortype",
          "attributes": {
            "percent": "-0.99"
          },
          "value": "Hack"
        },
        {
          "tag": "armortype",
          "attributes": {
            "percent": "-0.99"
          },
          "value": "Pierce"
        },
        {
          "tag": "armortype",
          "attributes": {
            "percent": "-0.99"
          },
          "value": "Crush"
        }
      ]
    },
    {
      "tag": "icon",
      "value": "god power frost icon"
    },
    {
      "tag": "usedicon",
      "value": "god power frost icon done"
    }
  ]
} as const;
export default frostPowerXmb;
