//                          I M P O R T I N G   M O D U L E S   A N D   M O D E L S

import express from 'express';
const router = express.Router()
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Poll from '../models/Poll.js'

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          P O S T   P O L L S

router.post('/', async(req, res) => {
    try{
        const { title, desc, options, expiresAt, privacy } = req.body;

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          V A L I D A T I O N S
        
        // Validating if there is the same title
        const pollsExisting = await Poll.findOne({title, createdBy: req.user.id});
        if(pollsExisting) return res.status(409).json({status: false, msg: 'You already have a poll with this name!'});

        // Validating if the user exists
        const userActual = await User.findById(req.user.id);
        if(!userActual) return res.status(404).json({status: false, msg: 'User not found!'});

        if(!title) return res.status(401).json({status: false, msg: 'Title or options not provided!'});
        if(!Array.isArray(options) || options.length < 2 || options.length > 6) return res.status(401).json({status: false, msg: 'Error in Options'})

        //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        //                          C R E A T I N G   P O L L S

        const newPoll = new Poll({
            title,
            desc,
            options,
            createdBy: req.user.id,
            expiresAt,
            privacy
        });

        try{
            await newPoll.save();
            res.status(201).json({success: true, msg:'Poll successfully created!'});
        }catch(e){
            res.status(500).json({success: false, msg: 'There was a server error: '+e})
        }
    }catch(e){
        res.status(500).json({status: false, msg: 'Error in server: '+e})
    };
});

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          G E T   P O L L S

router.get('/', async(req, res) => {
try{
    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S


    // Validating if the user exists
    const userActual = await User.findById(req.user.id);
    if(!userActual) return res.status(404).json({status: false, msg: 'User not found!'});

    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          G E T    P O L L S

    const userPolls = await Poll.find({createdBy: req.user.id});
    const userPollsPublic = await Poll.find({privacy: false});
    if (userPolls.length === 0 && userPollsPublic.length === 0) {
        return res.status(400).json({ status: false, msg: 'No polls found.' });
    }
    res.json({status: true, userPolls, userPollsPublic});

}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e})
}});

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          G E T   P O L L S   I D 

router.get('/:id', async(req, res) => {
try{
    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S
    const idPoll = req.params.id;

    const searchPoll = await Poll.findById(idPoll);
    if(!searchPoll) return res.status(404).json({ status: false, msg: 'Poll not found.' });
    if(searchPoll.privacy === false) return res.status(200).json({status: true, searchPoll});
    if(searchPoll.createdBy.toString() === req.user.id) return res.status(200).json({status: true, searchPoll});
    return res.status(403).json({ status: false, msg: 'You do not have access to this poll.' });

}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e})
}
});

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          E D I T   P O L L S   I D 

router.patch('/:id', async(req, res) => {
try{
    const idPoll = req.params.id;
    const { title, desc, options, expiresAt, privacy } = req.body;

    const searchPoll = await Poll.findById(idPoll);

    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S

    if(!searchPoll) return res.status(404).json({status: false, msg: 'Poll not found.'});
    if(searchPoll.createdBy.toString() !== req.user.id) return res.status(403).json({status: false, msg: 'You do not have access to this poll.'});
    if(title) searchPoll.title = title;
    if(desc) searchPoll.desc = desc;
    if(options && options.length >= 2 && options.length <=6) searchPoll.options = options;
    if(privacy !== undefined) searchPoll.privacy = privacy;
    if(expiresAt) {
        const now = new Date();
        const userDate = new Date(expiresAt);
        if(userDate < now) {
            return res.status(400).json({status: false, msg: 'Expiration date cannot be in the past!'});
        } else {
            searchPoll.expiresAt = userDate;
        }
    }

    await searchPoll.save();
    res.status(200).json({status: true, msg: 'Poll updated successfully!'})
}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e})
}
});

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          D E L E T E   P O L L S   I D 

router.delete('/:id', async(req, res) => {
try{
    const idPoll = req.params.id;

    const searchPoll = await Poll.findById(idPoll);

    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S

    if(!searchPoll) return res.status(404).json({status: false, msg: 'Poll not found.'});
    if(searchPoll.createdBy.toString() === req.user.id){
        await searchPoll.deleteOne();
        return res.status(200).json({status: true, msg: 'Poll deleted successfully!'});
    } else{
        return res.status(401).json({status: false, msg: 'You do not have permission to delete this poll!'});
    }
}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e});
}
});

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

//                          V O T E   P O L L S   I D 

router.post('/:id/vote', async(req, res) => {
try{
    const idPoll = req.params.id;
    let optionIndex = Number(req.body.option); // Turn into number
    const user = req.user.id;

    const searchPoll = await Poll.findById(idPoll);

    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S

    if(!searchPoll) return res.status(404).json({status: false, msg: 'Poll not found.'});


    if(isNaN(optionIndex)){ // Validating if it is a number
        return res.status(400).json({ status: false, msg: 'Option must be a number!' });
    };
    optionIndex = optionIndex - 1;
    if(optionIndex < 0 || optionIndex >= searchPoll.options.length){ // Validating if it is a valid option
        return res.status(400).json({ status: false, msg: 'Invalid option selected!' });
    };

    if(searchPoll.options[optionIndex].votesID.includes(user)) return res.status(400).json({status: false, msg: 'You have already voted in this poll!'});

    const now = new Date(); // Creates a Date object with the current system date and time.
    const userDate = new Date(searchPoll.expiresAt); // Transforms into a Date object
    if (isNaN(userDate.getTime())) { // Returns the value in milliseconds
        return res.status(400).json({ status: false, msg: 'Invalid date format!' });
    }
    if (userDate < now) { // Validating if the time in milliseconds is less
        return res.status(400).json({ status: false, msg: 'Poll has already expired!' });
    }

    if(searchPoll.privacy === false){
        searchPoll.options[optionIndex].votes += 1;
        searchPoll.options[optionIndex].votesID.push(req.user.id);
        await searchPoll.save();
        return res.status(200).json({status: true, msg: 'Vote successfully computed!'});
    }

    if(searchPoll.privacy === true && searchPoll.visibleBy.includes(user)){
        searchPoll.options[optionIndex].votes += 1;
        searchPoll.options[optionIndex].votesID.push(req.user.id);
        await searchPoll.save();
        return res.status(200).json({status: true, msg: 'Vote successfully computed!'});
    } else{
        return res.status(403).json({ status: false, msg: 'You do not have permission to vote in this poll!' });
    }
}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e});
};
});

router.get('/:id/results', async(req, res) => {
try{
    const idPoll = req.params.id;

    const searchPoll = await Poll.findById(idPoll);

    //▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

    //                          V A L I D A T I O N S

    if(!searchPoll) return res.status(404).json({status: false, msg: 'Poll not found.'});

    let totVotes = 0;

    searchPoll.options.forEach(opt => {
        totVotes += opt.votes
    })

    if (searchPoll.privacy === true && !searchPoll.visibleBy.includes(req.user.id)) {
        return res.status(403).json({ status: false, msg: 'You are not allowed to view this poll results!' });
    }

    if(searchPoll.createdBy.toString() === req.user.id){
        res.status(200).json({
            status: true,
            totalVotes: totVotes,
            options: searchPoll.options.map(opt => ({
                text: opt.text,
                votes: opt.votes,
                percent: totVotes > 0 ? ((opt.votes / totVotes) * 100).toFixed(2) + "%" : "0%"
            }))
        });
    }else{
        return res.status(401).json({status: false, msg: 'You are not allowed to do this!'});
    }
    


}catch(e){
    res.status(500).json({status: false, msg: 'Error in server: '+e});
}
});



export default router;