// Total War I
// designed by M0nTy_PyTh0n
// Email: djoser_2@hotmail.com
// Version 1.0
//
void main(void) {

    rmSetStatusText("",0.01);

    int myEnvironment = rmRandInt(1,2); // 1 = frozen , 2 = tropical

// Variables

    int j = 0;
    int k = 0;
    int failCount = 0;
    float myRandomFloat = 1.0;
    int myRandomInt = 1;
    string myDummyString = "";
    int myTiles = 9000;  

    if(cMapSize == 1) {
        myTiles = 12000; 
    }

    int mySize = 2 * sqrt(cNumberNonGaiaPlayers * myTiles);

    rmSetMapSize(mySize,mySize);

    rmSetSeaLevel(0);

    rmSetStatusText("",0.04);

    if(myEnvironment == 1) {
        rmSetSeaType("North Atlantic Ocean");
    }
    else {
        rmSetSeaType("Mediterranean Sea");
    }

    rmTerrainInitialize("water");

// Define some classes.
    int myPlayerClass = rmDefineClass("Player Class"); 
    int myPatchClass = rmDefineClass("Patch Class");

// Constraints

    rmSetStatusText("",0.07);

    int myAvoidEdgeConstraint       = rmCreateBoxConstraint("avoid edge constraint",rmXTilesToFraction(5),rmZTilesToFraction(5),1.0 - rmXTilesToFraction(5),1.0 - rmZTilesToFraction(5));
    int myAvoidLandConstraint       = rmCreateTerrainDistanceConstraint("avoid land constraint","land",true,10.0);
    int myAvoidOrcaConstraint       = rmCreateTypeDistanceConstraint("avoid orca constraint","orca",25.0);
    int myAvoidRelicConstraint      = rmCreateTypeDistanceConstraint("avoid relic constraint","relic",25.0);
    int myAvoidSettlementConstraint = rmCreateTypeDistanceConstraint("avoid settlement constraint","AbstractSettlement",30.0);
    int myAvoidSettlementSmallConstraint = rmCreateTypeDistanceConstraint("avoid settlement small constraint","AbstractSettlement",10.0);
    int myAvoidSharkConstraint      = rmCreateTypeDistanceConstraint("avoid shark constraint","shark",25.0);
    int myAvoidTreeConstraint       = rmCreateTypeDistanceConstraint("avoid tree constraint","tree",5.0); // 5.0 original
    int myAvoidWhaleConstraint      = rmCreateTypeDistanceConstraint("avoid whale constraint","whale",25.0);
    int myLandConstraint            = rmCreateTerrainDistanceConstraint("land constraint","land",false,1.0);

    rmSetStatusText("",0.10);

    // Type Classes Constraints (puts Type Constraints together)
    int myAvoidPlayerClass = rmCreateClassDistanceConstraint("Avoid Player Class Distance Constraint",myPlayerClass,20.0);
    int myAvoidPatchClass = rmCreateClassDistanceConstraint("Avoid Patch Class Distance Constraint",myPatchClass,6.0);

    rmSetStatusText("",0.13);

// Areas

    int myIsland = rmCreateArea("island");
    if(myEnvironment == 1) rmSetAreaTerrainType(myIsland,"SnowGrass25");
    else rmSetAreaTerrainType(myIsland,"GrassDirt25");
    rmSetAreaBaseHeight(myIsland,2);
    rmSetAreaCoherence(myIsland,0.8);             
    rmSetAreaHeightBlend(myIsland,10);
    rmSetAreaLocation(myIsland,0.5,0.5);
    rmSetAreaSize(myIsland,0.34,0.34);
    rmSetAreaSmoothDistance(myIsland,5);
    int myAvoidCoastConstraint = rmCreateEdgeDistanceConstraint("avoid coast constraint",myIsland,12.0);
    rmBuildArea(myIsland);

    rmSetStatusText("",0.16);

    int myCoast = rmCreateArea("coast",myIsland);
    if(myEnvironment == 1) rmSetAreaTerrainType(myCoast,"SnowB");
    else rmSetAreaTerrainType(myCoast,"GrassDirt25");
    rmSetAreaBaseHeight(myCoast,2);
    rmSetAreaCoherence(myCoast,1);   
    rmSetAreaHeightBlend(myCoast,5);
    rmSetAreaLocation(myCoast,0.5,0.5);  
    rmSetAreaSize(myCoast,0.28,0.28);
    rmBuildArea(myCoast);

    rmSetStatusText("",0.19);

    int myInnerValleyA = rmCreateArea("InnerValleyA",myIsland);
        if(myEnvironment == 1) {
            rmSetAreaTerrainType(myInnerValleyA,"SnowGrass50");
        }
        else {
            rmSetAreaTerrainType(myInnerValleyA,"GrassDirt50");
        }
    rmSetAreaBaseHeight(myInnerValleyA,2);
    rmSetAreaCoherence(myInnerValleyA,1.0);
    rmSetAreaHeightBlend(myInnerValleyA,3);    
    rmSetAreaLocation(myInnerValleyA,0.5,0.5);   
    rmSetAreaSize(myInnerValleyA,0.22,0.22);  
    rmBuildArea(myInnerValleyA);

    rmSetStatusText("",0.22);

// Players

    rmPlacePlayersCircular(0.42,0.42,0);

    float playerFraction = rmAreaTilesToFraction(3200);

    for(i = 1; < cNumberPlayers) {
        int myPlayer = rmCreateArea("Player"+i);
        rmAddAreaRemoveType(myPlayer,"tree");
        rmSetAreaBaseHeight(myPlayer,2);
        rmSetAreaCoherence(myPlayer,0.8);
        rmSetAreaHeightBlend(myPlayer,2);    
        rmSetAreaLocPlayer(myPlayer,i);
        rmSetAreaSize(myPlayer,rmXTilesToFraction(3),rmZTilesToFraction(3));
        rmSetPlayerArea(i,myPlayer);
        if(myEnvironment == 1) {
            rmSetAreaTerrainType(myPlayer,"NorseRoadA");
            rmAddAreaTerrainLayer(myPlayer,"SnowGrass25",0,3);
            rmAddAreaTerrainLayer(myPlayer,"SnowGrass50",3,5);
            rmAddAreaTerrainLayer(myPlayer,"SnowGrass75",5,7);
        }
        else {
            rmSetAreaTerrainType(myPlayer,"GreekRoadA");
            rmAddAreaTerrainLayer(myPlayer,"GrassDirt25",0,3);
            rmAddAreaTerrainLayer(myPlayer,"GrassDirt50",3,5);
            rmAddAreaTerrainLayer(myPlayer,"GrassDirt75",5,7);
        }
        rmAddAreaToClass(myPlayer,myPlayerClass);
        rmBuildArea(myPlayer);
        int myIslandConnection = rmCreateConnection("Connection to coast player "+i);
        rmSetConnectionType(myIslandConnection,cConnectAreas,true,100);
        rmAddConnectionArea(myIslandConnection,myPlayer); 
        rmAddConnectionArea(myIslandConnection,myIsland);
        if(myEnvironment == 1) {
            rmAddConnectionTerrainReplacement(myIslandConnection,"ShorelineAtlanticA","ShorelineAtlanticC");
        }
        else {
            rmAddConnectionTerrainReplacement(myIslandConnection,"ShorelineMediterraneanB","ShorelineMediterraneanD");
        }
        rmSetConnectionBaseHeight(myIslandConnection,2.0); // Sets the base height of a connection.
        rmSetConnectionCoherence(myIslandConnection,0.6); // Sets area coherence (0-1).
        rmSetConnectionWidth(myIslandConnection,12.0,0.0); 
        rmSetConnectionSmoothDistance(myIslandConnection,2.0); 
        rmBuildConnection(myIslandConnection); 
        }
        
    rmSetStatusText("",0.25);

// Objects

    int myTownCenter = rmCreateObjectDef("town center");
    rmAddObjectDefConstraint(myTownCenter,myLandConstraint);
    rmAddObjectDefItem(myTownCenter,"Settlement Level 1",1,0.0);
    rmPlaceObjectDefPerPlayer(myTownCenter,true);

    rmSetStatusText("",0.28);

   // Terrain Beautification
    failCount = 0;
    for(j=0; <cNumberPlayers*80){ 
        myRandomFloat = rmRandFloat(0,1); 
        int myTerrainBeautyPatch = rmCreateArea("patch beauty"+j,myIsland);
        rmAddAreaConstraint(myTerrainBeautyPatch,myLandConstraint);
        rmSetAreaSize(myTerrainBeautyPatch,rmAreaTilesToFraction(rmRandInt(30,200)),rmAreaTilesToFraction(rmRandInt(30,200)));
        if(myEnvironment==1){
            if(myRandomFloat<0.33){
            rmSetAreaTerrainType(myTerrainBeautyPatch,"ShorelineSandA");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowSand75", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowSand50", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowSand25", 2, 4);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"ShorelineSandA", 4, 6);
            }
            else if(myRandomFloat<0.66){
            rmSetAreaTerrainType(myTerrainBeautyPatch,"SnowA");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowGrass25", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowB", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowA", 2, 3);
            }
            else{
            rmSetAreaTerrainType(myTerrainBeautyPatch,"GrassB");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowGrass25", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowGrass50", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SnowGrass75", 2, 4);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"GrassB", 4, 6);
            }
        }
        else {
            if(myRandomFloat<0.33){
            rmSetAreaTerrainType(myTerrainBeautyPatch,"SavannahA");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SandA", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SavannahC", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SavannahB", 2, 4);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SavannahA", 4, 6);
            }
            else if(myRandomFloat<0.66){
            rmSetAreaTerrainType(myTerrainBeautyPatch,"SandD");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SandA", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SandB", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SandC", 2, 4);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"SandD", 4, 6);
            }
            else{
            rmSetAreaTerrainType(myTerrainBeautyPatch,"GrassB");
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"GrassDirt75", 0, 1);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"GrassDirt50", 1, 2);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"GrassDirt25", 2, 4);
            rmAddAreaTerrainLayer(myTerrainBeautyPatch,"GrassB", 4, 6);
            }
        }
        rmSetAreaMinBlobs(myTerrainBeautyPatch,1);
        rmSetAreaMaxBlobs(myTerrainBeautyPatch,1);
        rmSetAreaBaseHeight(myTerrainBeautyPatch,rmRandInt(2,4));
        rmSetAreaHeightBlend(myTerrainBeautyPatch,rmRandInt(2,3));    
        rmAddAreaToClass(myTerrainBeautyPatch,myPatchClass);
        rmAddAreaConstraint(myTerrainBeautyPatch,myAvoidPatchClass);
        rmAddAreaConstraint(myTerrainBeautyPatch,myAvoidPlayerClass);
        rmSetAreaMinBlobDistance(myTerrainBeautyPatch, 0.0);
        rmSetAreaMaxBlobDistance(myTerrainBeautyPatch, 0.0);
        rmSetAreaCoherence(myTerrainBeautyPatch, 0.1);
        rmSetAreaWarnFailure(myTerrainBeautyPatch,false);
        if(rmBuildArea(myTerrainBeautyPatch)==false){
        // Stop trying once we fail 3 times in a row.
                failCount++;
                if(failCount==3)
                break;
            }
            else
            failCount=0;
        }

    rmSetStatusText("",0.31);

    for (j=1; <=5*cNumberNonGaiaPlayers){
    int mySettlementA = rmCreateObjectDef("Settlement"+j);
    rmAddObjectDefConstraint(mySettlementA,myAvoidSettlementConstraint);
    rmAddObjectDefConstraint(mySettlementA,myAvoidCoastConstraint);
    rmAddObjectDefConstraint(mySettlementA,myAvoidTreeConstraint);
    rmAddObjectDefConstraint(mySettlementA,myLandConstraint);
    rmAddObjectDefItem(mySettlementA,"Settlement",1,0.0);
    rmPlaceObjectDefInArea(mySettlementA,0,myIsland,1);
    }

    rmSetStatusText("",0.34);

    // Relics
    int myRelic = rmCreateObjectDef("relic");
    rmAddObjectDefConstraint(myRelic,myAvoidRelicConstraint);
    rmAddObjectDefConstraint(myRelic,myAvoidSettlementSmallConstraint);
    rmAddObjectDefConstraint(myRelic,myAvoidCoastConstraint);
    rmAddObjectDefConstraint(myRelic,myAvoidTreeConstraint);
    rmAddObjectDefConstraint(myRelic,myLandConstraint);
    rmAddObjectDefItem(myRelic,"Relic",1,0.0);
    rmSetObjectDefMaxDistance(myRelic,90);
    rmSetObjectDefMinDistance(myRelic,60);
    rmPlaceObjectDefPerPlayer(myRelic,false,2);

    rmSetStatusText("",0.37);

    int myHawk = rmCreateObjectDef("Hawk");
    rmAddObjectDefConstraint(myHawk,myLandConstraint);
    rmAddObjectDefItem(myHawk,"Hawk",1,25.0);
    rmPlaceObjectDefPerPlayer(myHawk,false);
        
    rmSetStatusText("",0.40);

    for(i = 1; <= 3) {
        int myFish = rmCreateObjectDef("fish"+i);
        rmAddObjectDefConstraint(myFish,myAvoidLandConstraint);
        j = i % 3;
        if(j == 0) {
            rmAddObjectDefItem(myFish,"Fish - Mahi",1,25.0);
        }
        if(j == 1) {
            rmAddObjectDefItem(myFish,"Fish - Perch",1,25.0);
        }
        if(j == 2) {
            rmAddObjectDefItem(myFish,"Fish - Salmon",1,25.0);
        }
        rmSetObjectDefMaxDistance(myFish,rmZFractionToMeters(0.5));
        rmSetObjectDefMinDistance(myFish,0.0);
        rmPlaceObjectDefPerPlayer(myFish,false,1);
    }

    rmSetStatusText("",0.43);

    for(i = 1; <= 2) {
        int mySeaLife = rmCreateObjectDef("sealife"+i);
        rmAddObjectDefConstraint(mySeaLife,myAvoidEdgeConstraint);
        rmAddObjectDefConstraint(mySeaLife,myAvoidLandConstraint);
        rmAddObjectDefConstraint(mySeaLife,myAvoidOrcaConstraint);
        rmAddObjectDefConstraint(mySeaLife,myAvoidSharkConstraint);
        rmAddObjectDefConstraint(mySeaLife,myAvoidWhaleConstraint);
        if(myEnvironment == 1) {
            j = i % 2;
            if(j == 0) {
                rmAddObjectDefItem(mySeaLife,"Orca",1,0.0);
            }
            if(j == 1) {
                rmAddObjectDefItem(mySeaLife,"Whale",1,0.0);
            }
        }
        else {
            rmAddObjectDefItem(mySeaLife,"Shark",1,0.0);
        }
        rmSetObjectDefMaxDistance(mySeaLife,rmZFractionToMeters(0.5));
        rmSetObjectDefMinDistance(mySeaLife,0.0);
        rmPlaceObjectDefPerPlayer(mySeaLife,false,2);
    }

    rmSetStatusText("",0.46);

// Triggers

    rmCreateTrigger("Intro1");
    rmCreateTrigger("Intro2");
    rmCreateTrigger("Day");
    rmCreateTrigger("Dusk");
    rmCreateTrigger("Night");
    for(i=1;<=cNumberNonGaiaPlayers){
    rmCreateTrigger("DestroyIfDefeatPl"+i);
    }

    rmSetStatusText("",0.49);

    rmSwitchToTrigger(rmTriggerID("Intro1"));
    rmAddTriggerEffect("Fade To Color");
    rmSetTriggerEffectParamInt("R",0);
    rmSetTriggerEffectParamInt("G",0);
    rmSetTriggerEffectParamInt("B",0);
    rmSetTriggerEffectParamInt("Duration",0);
    rmSetTriggerEffectParamInt("Delay",0);
    rmSetTriggerEffectParam("Fade","true");
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("Intro2"));
    rmSetTriggerPriority(4);
    rmSetTriggerActive(true);
    rmSetTriggerRunImmediately(true);
    rmSetTriggerLoop(false);

    rmSetStatusText("",0.52);

    rmSwitchToTrigger(rmTriggerID("Intro2"));
    rmAddTriggerCondition("Timer");
    rmSetTriggerConditionParamInt("Param1",1);
    rmAddTriggerEffect("Fade To Color");
    rmSetTriggerEffectParamInt("R",0);
    rmSetTriggerEffectParamInt("G",0);
    rmSetTriggerEffectParamInt("B",0);
    rmSetTriggerEffectParamInt("Duration",500);
    rmSetTriggerEffectParamInt("Delay",0);
    rmSetTriggerEffectParam("Fade","false");
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParamInt("PlayerID", 0);
    rmSetTriggerEffectParam("Message", "Total War I - by M0nTy_PyTh0n");
    rmAddTriggerEffect("Sound Filename");
    rmSetTriggerEffectParam("Sound","plentychimes.wav");
    for(i=1; <= cNumberNonGaiaPlayers){
        rmAddTriggerEffect("Grant Resources");
        rmSetTriggerEffectParamInt("PlayerID",i);
        rmSetTriggerEffectParam("ResName","Gold");
        rmSetTriggerEffectParamInt("Amount",10000000);
        rmAddTriggerEffect("Grant Resources");
        rmSetTriggerEffectParamInt("PlayerID",i);
        rmSetTriggerEffectParam("ResName","Food");
        rmSetTriggerEffectParamInt("Amount",10000000);
        rmAddTriggerEffect("Grant Resources");
        rmSetTriggerEffectParamInt("PlayerID",i);
        rmSetTriggerEffectParam("ResName","Wood");
        rmSetTriggerEffectParamInt("Amount",10000000);
        rmAddTriggerEffect("Grant Resources");
        rmSetTriggerEffectParamInt("PlayerID",i);
        rmSetTriggerEffectParam("ResName","Favor");
        rmSetTriggerEffectParamInt("Amount",200);
        }
    for(i=1;<=cNumberNonGaiaPlayers){
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("DestroyIfDefeatPl"+i));
    }
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("Day"));
    rmSetTriggerPriority(4);
    rmSetTriggerActive(false);
    rmSetTriggerRunImmediately(false);
    rmSetTriggerLoop(false);

    rmSetStatusText("",0.55);

    // Day Night Trigger:
    rmSwitchToTrigger(rmTriggerID("Day"));
    rmAddTriggerCondition("Timer");
    rmSetTriggerConditionParamInt("Param1",700);
    rmAddTriggerEffect("Set Lighting");
    rmSetTriggerEffectParam("SetName","Dusk");
    rmSetTriggerEffectParamInt("FadeTime",95);        
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("Dusk"));
    rmSetTriggerActive(false);
    rmSetTriggerLoop(false);   

    rmSetStatusText("",0.58);

    rmSwitchToTrigger(rmTriggerID("Dusk"));
    rmAddTriggerCondition("Timer");
    rmSetTriggerConditionParamInt("Param1",100);
    rmAddTriggerEffect("Set Lighting");
    rmSetTriggerEffectParam("SetName","night");
    rmSetTriggerEffectParamInt("FadeTime",95);
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("Night"));
    rmSetTriggerActive(false);
    rmSetTriggerLoop(false);   

    rmSetStatusText("",0.61);

    rmSwitchToTrigger(rmTriggerID("Night"));
    rmAddTriggerCondition("Timer");
    rmSetTriggerConditionParamInt("Param1",300);
    rmAddTriggerEffect("Set Lighting");
    rmSetTriggerEffectParam("SetName","default");
    rmSetTriggerEffectParamInt("FadeTime",100);    
    rmAddTriggerEffect("Fire Event");
    rmSetTriggerEffectParamInt("EventID",rmTriggerID("Day"));
    rmSetTriggerActive(false);
    rmSetTriggerLoop(false);

    rmSetStatusText("",0.64);

    // Create Player Defeated -> Destroy All  Triggers:

    rmSetStatusText("",0.67);

    for(i=1; <= cNumberNonGaiaPlayers){
    rmSwitchToTrigger(rmTriggerID("DestroyIfDefeatPl"+i));
    rmAddTriggerCondition("Player Defeated");
    if(i==1) rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==2)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==3)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==4)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==5)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==6)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==7)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==8)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==9)  rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==10) rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==11) rmSetTriggerConditionParamInt("PlayerID",i);
    else if (i==12) rmSetTriggerConditionParamInt("PlayerID",i);
    rmAddTriggerEffect("Player Destroy All Buildings");
    rmSetTriggerEffectParamInt("Player",i);
    rmAddTriggerEffect("Player Destroy All Units");
    rmSetTriggerEffectParamInt("Player",i);
    rmAddTriggerEffect("Send Chat");
    rmSetTriggerEffectParamInt("PlayerID", 0);
//  rmSetTriggerEffectParam("Message", rmGetPlayerName(i)+" is out of the game.");
    rmSetTriggerEffectParam("Message", "{PlayerNameString("+i+",22612)}");
    rmAddTriggerEffect("Play Dialog");
    rmSetTriggerEffectParam("Ignore","false");
    rmSetTriggerEffectParam("Sound","lightningstrike4.wav");
    rmSetTriggerPriority(4);
    rmSetTriggerActive(false);
    rmSetTriggerRunImmediately(false);
    rmSetTriggerLoop(false);
    }

    rmSetStatusText("",0.70);
    rmSetStatusText("",0.73);
    rmSetStatusText("",0.76);
    rmSetStatusText("",0.79);
    rmSetStatusText("",0.82);
    rmSetStatusText("",0.85);
    rmSetStatusText("",0.88);
    rmSetStatusText("",0.91);
    rmSetStatusText("",0.94);
    rmSetStatusText("",0.97);
    rmSetStatusText("",1.00);
}
