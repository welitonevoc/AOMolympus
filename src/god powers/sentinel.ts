// Auto-converted from sentinel.xmb (Age of Mythology XMB God Power Definition)
export const sentinelPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Sentinel",
    "techname": "sentinel",
    "type": "TempUnit"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "-1"
    },
    {
      "tag": "placement",
      "attributes": {
        "allowgaia": "",
        "ally": "",
        "forceonmap": "1",
        "matchtype": "AbstractSettlement",
        "usetargetunitpositionforplacement": ""
      },
      "value": "unit"
    },
    {
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "ally"
      },
      "value": "10.0"
    },
    {
      "tag": "abstractplacementtargettype",
      "value": "Settlement Level 1"
    },
    {
      "tag": "abstractplacementtargettype",
      "value": "Citadel Center"
    },
    {
      "tag": "attachproto",
      "value": "Sentinel Base"
    },
    {
      "tag": "createunit",
      "attributes": {
        "delay": "0.0",
        "maxradius": "27",
        "minradius": "19",
        "norotate": "",
        "pattern": "symmetric",
        "quantity": "4"
      },
      "value": "Sentinel Main"
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
        "listenertype": "IfOnScreenAlly",
        "type": "StartSound"
      },
      "value": "SentinelBirth"
    },
    {
      "tag": "icon",
      "value": "god power sentinel icon"
    },
    {
      "tag": "usedicon",
      "value": "god power sentinel icon done"
    }
  ]
} as const;
export default sentinelPowerXmb;
