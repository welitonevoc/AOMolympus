// Auto-converted from darkest night.xmb (Age of Mythology XMB God Power Definition)
// Bast (Egyptian Age 2) — Noite das Trevas: extends fog of war and empowers Egyptian units
export const darkestNightPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "Darkest Night",
    "techname": "darkest_night",
    "type": "darkest_night"
  },
  "children": [
    {
      "tag": "builduptime",
      "value": "1.0"
    },
    {
      "tag": "activetime",
      "value": "30.0"
    },
    {
      "tag": "shutdowntime",
      "value": "2.0"
    },
    {
      "tag": "placement",
      "value": "self"
    },
    {
      "tag": "radius",
      "value": "0.0"
    },
    {
      "tag": "soundset",
      "attributes": {
        "listenertype": "All",
        "type": "StartSound"
      },
      "value": "DarkestNightStart"
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
      "tag": "nightambientsfx",
      "value": "Bast Night Ambience"
    },
    {
      "tag": "skylightmult",
      "value": "0.18"
    },
    {
      "tag": "fogexpandradius",
      "value": "12.0"
    },
    {
      "tag": "attackbonuspct",
      "attributes": {
        "unittype": "MythUnit"
      },
      "value": "0.25"
    },
    {
      "tag": "attackbonuspct",
      "attributes": {
        "unittype": "Scout"
      },
      "value": "0.40"
    },
    {
      "tag": "speedbonuspct",
      "attributes": {
        "pantheon": "egyptian"
      },
      "value": "0.15"
    },
    {
      "tag": "playerrelation",
      "value": "self"
    },
    {
      "tag": "minimapeventtime",
      "value": "30.0"
    },
    {
      "tag": "powerblocker",
      "value": "0.0f"
    },
    {
      "tag": "icon",
      "value": "god power darkest night icon"
    },
    {
      "tag": "usedicon",
      "value": "god power darkest night icon done"
    }
  ]
} as const;
export default darkestNightPowerXmb;
