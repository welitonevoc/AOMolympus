// Auto-converted from pestilence.xmb (Age of Mythology XMB God Power Definition)
export const pestilencePowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Pestilence",
    "techname": "Pestilence",
    "type": "Pestilence"
  },
  "children": [
    {
      "tag": "placement",
      "attributes": {
        "enemy": "",
        "forceonmap": "1"
      },
      "value": "free"
    },
    {
      "tag": "activetime",
      "value": "50.0"
    },
    {
      "tag": "radius",
      "value": "30.0f"
    },
    {
      "tag": "reveallos",
      "attributes": {
        "radius": "30.0"
      },
      "value": "Revealer To Player"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "10",
        "radius": "30.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Greek SFX"
    },
    {
      "tag": "rescaninterval",
      "value": "5.0f"
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
      "value": "PestilenceBirth"
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
      "tag": "minimapeventtime",
      "attributes": {
        "sendalertto": "all"
      },
      "value": "10.0"
    },
    {
      "tag": "powerplayerrelation",
      "value": "enemy"
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "AbstractFortress"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX2"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Barracks"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Archery Range"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Stable"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Academy"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Dock"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Siege Camp"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Longhouse"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Temple"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Barracks Atlantean"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "abstracttype",
      "children": [
        {
          "tag": "type",
          "value": "Counter Building"
        },
        {
          "tag": "sfxtype1",
          "value": "Pestilence SFX1"
        }
      ]
    },
    {
      "tag": "icon",
      "value": "god power pestilence icon"
    },
    {
      "tag": "usedicon",
      "value": "god power pestilence icon done"
    }
  ]
} as const;
export default pestilencePowerXmb;
