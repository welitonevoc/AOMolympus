Trigger Loader v2.0.2
14 february 2010

Installation Instructions:
--------------------------
Unpack and move the "typeLoader.xml" file to "program files\microsoft games\age of mythology\trigger" (Vanilla only);
Unpack and move the "typeLoaderX.xml" file to "program files\microsoft games\age of mythology\trigger2" (TT only);
Unpack and move the "Loader Reference" folder to "program files\microsoft games\age of mythology\docs" (Developers only);

What is this?
-------------
Basically all the useful functions we have made through the ages have been gathered in this single file. The basic idea was to provide an easier to use environment for trigger scripters, where they had new functions and variables at their disposal. However, with the latest release, we have decided to integrate invent00rs new trigger array system. Because of this, we decided to make a whole trigger framework around these new functions, ready to be used by scenario designers. This framework is still in early stages, and will be expanded with every new release. So, expect a variety of new triggers to become possible or at least easier to create.

How to use:
-----------

Scripters:
~~~~~~~~~~
Use the documents in the Loader Reference folder to make yourself familiar with the new functions and variables. It's made with javadoc, so you might find some strange references in it, but it shouldn't be a big problem to understand what we're on about. In order to call them, the "Activate Trigger Loader" effect must be added first. Make sure that you add the trigger effect (in chronological order!) before any new triggers that require the new functions.

Scenario Designers:
~~~~~~~~~~~~~~~~~~~
You probably won't need the Loader Reference files, but make sure to add the "Activate Trigger Loader" effect (in chronological order!) before any triggers that require the new functions, such as the custom QVs. If you're not sure that you will need this trigger, remember that activating the effect does not change the gameplay or load speed. So it might be a good idea to put it as the first effect of every new map you start. It is designed to allow more effects in the same trigger to work, but preferably put it alone anyhow.

Can I help?
-----------

Scripters:
~~~~~~~~~~
If you just made some awesome (or less awesome) new functionality for triggers, let us know and your tool might get a place in the next version of our trigger loader. You will obviously get full credit for your work. Remember to shoot... euhm report any bugs at sight! It's a huge work, so it's not unlikely you will find some.

Scenario Designers:
~~~~~~~~~~~~~~~~~~~
Since you probably don't know much about scripting, it's best to always ask your new trigger requests in the "Trigger Request Thread" by Mythic_Freak at AoMH. However, if you have a great idea that you think might be useful for our loader nonetheless, don't hesitate and let us know! We also rely on you to report us any problems and/or bugs you come across while playtesting.

This utility was brought to you by:
Mythic_Freak & invent00r

Contact:
--------
Mythic_Freak: mythic[dot]freak[at]gmail[dot]com
invent00r: invent00r[at]gmail[dot]com