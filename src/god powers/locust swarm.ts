// Auto-converted from locust swarm.xmb (Age of Mythology XMB God Power Definition)
export const locustSwarmPowerXmb = {
  "tag": "power",
  "attributes": {
    "name": "LocustSwarm",
    "techname": "locust swarm",
    "type": "locust"
  },
  "children": [
    {
      "tag": "activetime",
      "value": "28.0"
    },
    {
      "tag": "minimapeventtime",
      "value": "28.0"
    },
    {
      "tag": "radius",
      "value": "4.0"
    },
    {
      "tag": "rangeindicatorprotoid",
      "attributes": {
        "indicatorcount": "3",
        "radius": "4.0",
        "speed": "0.2"
      },
      "value": "UI Range Indicator Egypt SFX"
    },
    {
      "tag": "abstractattacktargettype",
      "value": "LogicalTypeValidLocustSwarmTarget"
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
      "tag": "swarm",
      "value": "locust swarm"
    },
    {
      "tag": "swarmcount",
      "value": "1"
    },
    {
      "tag": "speed",
      "value": "3.0"
    },
    {
      "tag": "icon",
      "value": "god power locust swarm icon"
    },
    {
      "tag": "usedicon",
      "value": "god power locust swarm icon done"
    }
  ]
} as const;
export default locustSwarmPowerXmb;
