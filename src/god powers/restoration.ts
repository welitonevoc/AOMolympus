// Auto-converted from restoration.xmb (Age of Mythology XMB God Power Definition)
export const restorationPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Restoration",
    "techname": "Restoration",
    "type": "healing"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "6"
    },
    {
      "tag": "radius",
      "value": "50.0f"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "50.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Greek SFX"
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
      "value": "RestorationBirth"
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
      "tag": "placement",
      "attributes": {
        "forceonmap": "1"
      },
      "value": "free"
    },
    {
      "tag": "healtype",
      "value": "LogicalTypeAffectedByRestoration"
    },
    {
      "tag": "healsfx",
      "value": "Healing SFX"
    },
    {
      "tag": "healspeed",
      "value": "30.0"
    },
    {
      "tag": "areasfx",
      "value": "Healing Area SFX"
    },
    {
      "tag": "scaninterval",
      "value": "1.0"
    },
    {
      "tag": "icon",
      "value": "god power restoration icon"
    },
    {
      "tag": "usedicon",
      "value": "god power restoration icon done"
    }
  ]
} as const;
export default restorationPowerXmb;
