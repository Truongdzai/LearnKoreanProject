READING = {
    (1, 120): ("Mr. Ellis and Ms. Barnes were both highly qualified, but ------- got the job.",
               ["myself", "neither", "anybody", "whoever"]),
    (1, 121): ("Ennis Photography purchased all new lighting equipment ------- the high cost.",
               ["even though", "however", "until", "despite"]),
    (1, 150): ('At 11:23 A.M., what does Ms. Seang imply when she writes, '
               '"I have plenty to go around"?',
               ["She intends to create an extra-large mosaic.",
                "She has been collecting sea glass for many years.",
                "She can share her sea glass with all the workshop participants.",
                "She does not think she will use much of her sea glass."]),
    (1, 151): ("What is mentioned about Mr. Norton?",
               ["He will be attending a sales conference.",
                "He sent Ms. Correa an office supply request.",
                "He wrote an article in the September newsletter.",
                "He will be moving to another company location."]),
    (1, 166): ("What is required of job applicants?",
               ["Skill in working with others", "Previous design experience",
                "A willingness to work on weekends",
                "An ability to use certain software applications"]),
    (1, 195): ("What is the background color on the cover of item N3-GT?",
               ["Blue", "Black", "Yellow", "White"]),
    (2, 131): ("", ["Now that", "After all", "Otherwise", "Before long"]),
    (2, 136): ("", ["Its", "Such", "Some", "None"]),
    (2, 144): ("", ["Likewise", "Therefore", "Regardless", "Alternatively"]),
    (2, 167): ("According to the advertisement, how can customers choose the look of "
               "their XC-35?",
               ["By making a telephone call", "By visiting a Web site",
                "By sending an e-mail", "By reviewing automobile magazines"]),
    (3, 182): ("What is indicated in the article about Angus Milne?",
               ["He used to travel to New York every year.",
                "He moved his firm from London to Edinburgh.",
                "He created a company 100 years ago.",
                "He wrote a popular musical."]),
    (4, 146): ("", ["I want to thank you again for the nomination.",
                    "I can certainly see the resemblance.",
                    "I think it was all just a misunderstanding.",
                    "I believe this arrangement can benefit us both."]),
    (4, 151): ("What is indicated about Dr. Jaris?",
               ["He is employed by a university laboratory.",
                "He has published a book on device design and development.",
                "He assembles prototypes of sensing instruments.",
                "He works as an engineer at Alita Technology."]),
    (5, 101): ("Mr. Choi, who recently joined the advisory board, is an experienced "
               "accountant ------- investor.",
               ["but", "that", "and", "yet"]),
    (5, 200): ("Based on the report, what test resulted in the replacement of a machine part?",
               ["102", "393", "477", "488"]),
    (6, 132): ("", ["No additional fee will be charged for bringing a bicycle.",
                    "Always make sure to exit at the correct bus stop.",
                    "Special lanes for bicycles are now found on most highways.",
                    "Some passengers qualify for reduced bus fare."]),
    (6, 178): ("In the second e-mail, what is mentioned about Sklarr Press?",
               ["It specializes in large orders.",
                "It used to be owned by Ms. Xu.",
                "It has printed issues of Best Design Insights in the past.",
                "It is the oldest print service in the region."]),
    (6, 185): ("At approximately what time does Mr. Iqbal plan to arrive at the party?",
               ["5:00 P.M.", "6:00 P.M.", "7:30 P.M.", "8:30 P.M."]),
    (7, 150): ("What did Mr. Thielen receive for signing up for the rewards program?",
               ["1 point", "20 points", "80 points", "100 points"]),
    (7, 174): ('At 7:41 P.M., what does Ms. Leven imply when she writes, '
               '"That one is the best"?',
               ["She appreciated a prior online chat discussion.",
                "She has been eager to try a new product.",
                "She finds Mr. Talbert's question helpful.",
                "She is pleased with the device she uses."]),
    (7, 195): ("What problem does Mr. Barr describe?",
               ["Protecto products are not modern-looking.",
                "Visitors were not using an umbrella stand.",
                "The lobby of his building is not clean.",
                "Some disposable umbrella bags were too small."]),
    (8, 170): ("What information is included with the contract?",
               ["Details about equipment that will be provided",
                "Instructions for submitting original receipts",
                "Driving directions to the venue",
                "An agenda for the event"]),
    (8, 185): ('In the review, the word "situated" in paragraph 3, line 2, is closest '
               "in meaning to",
               ["established", "arranged", "parked", "positioned"]),
    (9, 135): ("", ["vehicles", "appliances", "ingredients", "components"]),
    (9, 136): ("", ["was", "can be", "is being", "has been"]),
    (9, 137): ("", ["Then, use a soft brush or sponge to finish cleaning.",
                    "Cleaning utensils must be purchased separately.",
                    "Finally, place the cooker back in its box.",
                    "A light will go on when the rice is cooked."]),
    (10, 182): ("What is indicated in the notice about August's cooking classes at "
                "Richmond Supermarket?",
                ["They feature dishes from different countries.",
                 "They are held on different days of the week.",
                 "They are taught by supermarket employees.",
                 "They require students to register in person."]),
    (10, 193): ("What can be concluded about Ms. Johnson?",
                ["She is currently working in Kuwait.",
                 "She has done business with Freewheel Oasis before.",
                 "She has agreed to let Freewheel Oasis charge her a service fee.",
                 "She plans to buy a bicycle from Freewheel Oasis."]),
}

def reading_patch(test: int) -> dict[int, dict]:
    return {
        n: {"n": n, "text": text, "options": list(options), "answer": None, "explain": ""}
        for (t, n), (text, options) in READING.items() if t == test
    }

LISTENING = {
    (3, 100): {
        "q": "Look at the graphic. Which bus stop does the speaker recommend getting off at?",
        "options": ["Orchard", "Heath", "Grove", "Meadow"],
        "viOptions": ["Trạm Orchard", "Trạm Heath", "Trạm Grove", "Trạm Meadow"],
    },
}

def apply_listening(test: int, listening: dict) -> list[int]:
    done = []
    for part in ("p1", "p2"):
        for item in listening[part]:
            patch = LISTENING.get((test, item["n"]))
            if patch:
                item.update(patch)
                done.append(item["n"])
    for part in ("p3", "p4"):
        for group in listening[part]:
            for item in group["questions"]:
                patch = LISTENING.get((test, item["n"]))
                if patch:
                    item.update(patch)
                    done.append(item["n"])
    return sorted(done)
