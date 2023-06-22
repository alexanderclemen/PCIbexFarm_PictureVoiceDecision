/*  author:  Alexander Clemen
    contact: alexander.clemen@uni-duesseldorf.de
             alexanderclemen.github.io
    Last updated: 15.06.2023
 */
 
PennController.ResetPrefix(null) // this is done so we don't need to write PennController before every command

//// Turn off debugger when you are ready to publish
DebugOff()

//// for counterbalancing:
//// info from: https://doc.pcibex.net/global-commands/setcounter/

AddTable( "myTable" ,
  "Group,Button\n"+
  "A,Hello\n"+
  "B,World"
);


Sequence("counter", "consent", "instructions", "experimental-trial" ,"send", "completion_screen");

//// for counterbalancing:

SetCounter("counter", "inc", 1);

Template( "myTable" , row =>
  newTrial( "trial" ,
    newButton( "greetings" , row.Button )
        .print()
        .wait()
  )
);


// Consent form //
//// this is an optional consent form:
    // 1. an html file that can be changed in "Resources"
    // 2. a Button with a "warning" given it is not checked
// to use the form remove the "/*" and "*/"


newTrial("consent",
    newHtml("consent_form", "consent.html") // wir die Einwilligungserklärung als html-Datei ein 
        .cssContainer({"width":"720px"}) // hier bestimmen wir die Größe des  Formulars
        .checkboxWarning("Du musst erst der Einwilligungserklärung zustimmen bevor es weiter geht.")
        .print()
    ,
    // nun erstellen wir einen Knopf der gedrückt werden muss damit es weiter geht.
    newButton("continue", "Klicke um fortzufahren")
        .center()
        .print()
        .wait(getHtml("consent_form").test.complete() // wir sagen "erst weiter machen wenn der Knopf angekreuzt ist"
            .failure(getHtml("consent_form").warn())
        )
)


// Instruction screen //
// This is the Instructions screen consisting of 
 // 1. a cssContainer (text) mit instructions
 // 2. a cssContainer als Textfeld sodass z.B. Teilnehmer-ID abgefragt werden können
 // 3. a "weiter" Button
 // 4. einem Befehl, der die Werte aus (2.) speiche
 

newTrial("instructions",
    defaultText
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
    ,
    //nun kommt der Test
    newText("Hello")
    ,
    newText("In this experiment you are asked to decide whether the building (appearing at the center of the screen) would be spoken out loud in a male voice or in a female voice.")
    ,
    newText("To do this, press <b>2</b> if the building should be spoken out in the voice bottom-left of the picture, or <b>9</b> if the building should be spoken out in the voice bottom-right of the picture.")
    ,
    newText("The text 'male voice' and 'female voice' below the picture is randomized but hand symbold will help you to keep track of your hands.")
    ,
    newText("You should do this as quickly and accurately as possible.")
    ,
    newText("When you are ready, insert your ID and press SPACE to do a practice run.")
    ,
        // dies macht ein Textfeld in dem man seine ID eintragen kann
    // um neue Variablen abzufragen müssen weitere "newTextInput" erstellt UND unten als "newVar" gespeichtert werden
    newTextInput("input_ID")
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
    ,
        // dies kreirt eine neue Variable uns speichert den Wert aus obigem TextInput
    newVar("ID")
        .global()
        .set(getTextInput("input_ID"))
    ,
    newKey(" ").wait()  // Finish trial upon press on spacebar
)


//// ---
// Experimental Trial //
//// The experiment is running in the Experimental Trial
Template("stimuli.csv", row =>
    newTrial("experimental-trial",
    // ---
    // we create everything we **need**
    // ---
        // // itner stimulus interval wird auf x ms gestellt
        newTimer("break", 500)
            .start()
            .wait()
        ,
        // wir importieren die Stimuli Bilder(namen) aus der stimuli.csv Tabelle
        newImage("picture", row.picture)
            .size(300, 300)
        ,
        // wir kreiren den text "male voice" für spätere Verwendung
        newText("text_male", "male voice")
            .cssContainer({
            //padding: '0.5em',
            'text-align': 'center',
            "justify-content": 'center',
            "align-items": 'center' ,
            'font-size': '50px',
        })
        ,
        // create the text "female voice" for later use
        newText("text_female", "female voice")
            .cssContainer({
            //padding: '0.5em',
            'text-align': 'center',
            "justify-content": 'center',
            "align-items": 'center' ,
            'font-size': '50px',
            })
        // .print() // !! I think we don't need this because .print comes at the canvas
        ,
        // wir importieren die das Bild der linken Hand for later use
        newImage("leftHand", "leftHand.png")
            .size(50, 50)
        ,
        // wir importieren die das Bild der rechten Hand for later use
        newImage("rightHand", "rightHand.png")
            .size(50, 50)
        // das hier ist der timeout in ms sodass die VPs max. 2 sec zeit haben zu antworten
        ,
        // the Trial will stop after 2 seconds
        newTimer("timeout", 2000)
            .start()
        ,
    // ---
    // we create everything the participants **see** and we **measure**
    // ---
        // dies kreirt ein weißen Hintergrund auf dem die Stimuli plaziert werden
        newCanvas("canvas_image", 600,300)
            .add(100,0, getImage("picture"))
            .center()
            .print()
            .log()
        ,
        // dies kreirt ein weißen Hintergrund auf dem die Texte, welche oben kreirt wurden, plaziert werden
        newCanvas("canvas_text", 600,50)
            .add(0,0, getText("text_male"))
            .add(320,0, getText("text_female"))
            .print()
        ,
        // dies kreirt ein weißen Hintergrund auf dem die Hände, welche oben kreirt wurden, plaziert werden
        newCanvas("canvas_hands", 600,50)
            .add(100,0, getImage("leftHand"))
            .add(400,0, getImage("rightHand"))
            .print()
       ,
        // der Selector wurd hinzugefügtr um die shuffle-Funktion zu nutzen
        // dieser randomisiert "male voice" und "female voice"
        // und erlaubt die Verwendung von Tastendrücken
        newSelector("selection")
        .add(getText("text_male"), getText("text_female"))    
            .shuffle()
            .keys("no click")
            .keys("2", "9")
            .log()
            .callback(getTimer("timeout").stop())
        ,
        getTimer("timeout")
            .wait()
    )
    .log("item", row.item)
    .log("gender",row.gender)
    .log("target", row.target)
    .log("ID", getVar("")) 
)

// Send results manually //
SendResults("send")

//// ---
// Completion screen //
newTrial("completion_screen",
    newText("thanks", "Vielen Dank für Ihre Teilnahme! Sie können das Fenster nun verlassen.")
        .center()
        .print()
    ,
    newButton("void", "")
        .wait()
   
)



