const express = require("express");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");

const router = express.Router();

//ROUTE 1: Create/Add a note using POST: 'localhost:3000/api/notes/addNote' (LOGIN REQUIRED)
router.post("/addNote", fetchUser,
    [
        // VALIDATOR (check for properness/correctness of values entered)
        body(
            "title",
            "Title should not be empty or length less than 3 characters!"
        ).isLength({ min: 3 }),
        body("description", "should not be less than 3 characters!").isLength({
            min: 3,
        }),
    ],
    async (req, res) => {
        const { title, description, tag } = req.body; // DESTRUCTURING

        // If there are errors, return Bad requiest and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const note = new Note({ user: req.user.id, title, description, tag });
            const addedNote = await note.save();
            res.json(addedNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error!");
        }
    }
);

// ROUTE 2: Get notes of logged in user using GET:'localhost:3000/api/notes/getAllNotes' (LOGIN REQUIRED)
router.get("/getAllNotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error!");
    }
});

//ROUTE 3: Update existing note of a user using PUT: 'localhost:3000/api/notes/updateNote' (LOGIN REQUIRED)
router.put("/updateNote/:id", fetchUser, async (req, res) => {
    try {
        //DESTRUCTURING : getting updated items
        const { title, description, tag } = req.body;

        // create dummy note : then putting the updates items in it
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // find the note to be updated and then update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            // if note does not exits then send not found status
            return res.status(404).send("Not found");
        }

        //USER IS AUTHERISED OR NOT : Check if the user who created the note and the logged in user match or not
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        //Update the note
        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        );
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error!");
    }
});

//ROUTE 4: Delete existing note using DELETE:'localhost:3000/api/notes/deleteNote' (LOGIN REQUIRED)
router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
    try {
        // find the note to be deleted and then delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            // if note does not exits then send not found status
            return res.status(404).send("Not found");
        }

        //USER IS AUTHERISED OR NOT : Check if the user who created the note and the logged in user match or not
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        //Delete the note
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ Success: "The note has been deleted", note: note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error!");
    }
});

module.exports = router;
