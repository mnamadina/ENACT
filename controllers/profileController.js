'use strict';
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Resource = require('../models/Resource');


exports.findOneUser = async (req, res, next) => {
    let userId = req.params.id
    try {
        let userInfo = await User.findOne({_id: userId})
        res.render('./pages/showProfile', {
            userInfo: userInfo,
            sentStatus: 'Email Not Sent'
        })
    } catch (e) {
        next(e)
    }
}

exports.updateProfile = async (req, res, next) => {
    let userToUpdate = await User.findOne({_id: req.user._id})
    try {
        let toIndex = false
        if (userToUpdate.userName === undefined)
            toIndex = true
        userToUpdate.userName = req.body.userName;
        userToUpdate.password = req.body.password;
        userToUpdate.workEmail = req.body.workEmail;
        userToUpdate.personalEmail = req.body.personalEmail;
        userToUpdate.state = req.body.state;
        userToUpdate.department = req.body.department;
        userToUpdate.personalWebsiteURL = req.body.personalWebsiteURL;
        userToUpdate.linkedInURL = req.body.linkedInURL;
        userToUpdate.pronoun = req.body.pronoun;
        userToUpdate.phoneNumber = req.body.phoneNumber;
        userToUpdate.affiliation = req.body.affiliation;
        if (req.body.networkCheck === 'on')
            userToUpdate.networkCheck = 'on';
        else
            userToUpdate.networkCheck = 'off';
        userToUpdate.graduationYear = req.body.graduationYear;
        console.log("on or off: ", userToUpdate.networkCheck)
        await userToUpdate.save()
        if (toIndex)
            res.redirect('/')
        res.redirect('/profile/view/' + req.user._id)
    } catch (e) {
        next(e)
    }
}


exports.updateProfileAdmin = async (req, res, next) => {
    let userToUpdate = await User.findOne({_id: req.params.userId})
    try {
        userToUpdate.userName = req.body.userName;
        // userToUpdate.password = req.body.password;
        userToUpdate.workEmail = req.body.workEmail;
        userToUpdate.personalEmail = req.body.personalEmail;
        userToUpdate.state = req.body.state;
        userToUpdate.department = req.body.department;
        userToUpdate.personalWebsiteURL = req.body.personalWebsiteURL;
        userToUpdate.linkedInURL = req.body.linkedInURL;
        userToUpdate.pronoun = req.body.pronoun;
        userToUpdate.phoneNumber = req.body.phoneNumber;
        userToUpdate.affiliation = req.body.affiliation;
        if (req.body.networkCheck === 'on')
            userToUpdate.networkCheck = 'on';
        else
            userToUpdate.networkCheck = 'off';
        userToUpdate.graduationYear = req.body.graduationYear;
        console.log("on or off: ", userToUpdate.networkCheck)
        await userToUpdate.save()
        console.log("update success!")
        res.redirect('/profile/view/' + req.params.userId)
    } catch (e) {
        next(e)
    }
}

exports.createFaculty = async (req, res, next) => {
    if (res.locals.status === 'admin') {
        try {
            let email = req.body.email
            let name = req.body.userName
            let status = 'faculty'
            let existUserCheck = await User.findOne({
                $or: [
                    {workEmail: email}, {googleemail: email}
                ]
            })
            console.log(existUserCheck)
            let password = await getRandomPassword()
            if (existUserCheck)
                res.send("This user exists in our system, please contact developer.")
            let newUser = new User({
                workEmail: email,
                userName: name,
                password: password,
                status: status
            })
            await newUser.save()
            let newFaculty = new Faculty(
                {
                    userId: newUser._id,
                    email: email,
                    status: status,
                    approvedBy: res.locals.user._id,
                }
            )
            console.log("new faculty")
            // await until the newCourse is saved properly
            await newFaculty.save()
            res.redirect('/profile/update/' + newUser._id)
        } catch (e) {
            next(e)
        }
    } else {
        res.send("you are not admin!")
    }
}

async function getRandomPassword() {
    // this only works if there are many fewer than 10000000 courses
    // but that won't be an issue with this alpha version!
    return Math.floor(Math.random() * 10000000)
}

exports.loadFaculty = async (req, res, next) => {
    if (res.locals.status === 'admin') {
        try {
            let approvedList = await Faculty.find()
            let approvedByList = []
            for (let element of approvedList) {
                let user = await User.findOne({_id: element.approvedBy})
                if (user)
                    approvedByList.push(user.userName)
                else
                    approvedByList.push("unknown")
            }
            res.render('./pages/admin-createFaculty', {
                approvedList: approvedList,
                approvedByList: approvedByList
            })
        } catch (e) {
            next(e)
        }
    } else {
        res.send("you are not admin in loading faculty!")
    }
}

exports.showAllProfiles = async (req, res, next) => {
    let profiles = await User.find().collation({locale: 'en'}).sort({userName: 1})
    try {
        res.render('./pages/showAllProfiles', {
            profiles: profiles
        })
    } catch (e) {
        next(e)
    }
}

exports.updateProfileImageURL = async (req, res, next) => {
    let userToUpdate = await User.findOne({_id: res.locals.user._id})
    try {
        userToUpdate.profilePicURL = req.body.imageURL;
        await userToUpdate.save()
        res.redirect('back')
    } catch (e) {
        next(e)
    }
}

exports.updateProfileImageURLAdmin = async (req, res, next) => {
    let userToUpdate = await User.findOne({_id: req.params.userId})
    try {
        userToUpdate.profilePicURL = req.body.imageURL;
        await userToUpdate.save()
        res.redirect('back')
    } catch (e) {
        next(e)
    }
}

let special = ["stimell@brandeis.edu", "djw@brandeis.edu","jayrkaufman@gmail.com"]
exports.showFacultyProfiles = async (req, res, next) => {
    // sort by lastname
    let profileInfo = await User.find({status: "faculty"}).collation({locale: 'en'})
    let duplicate = JSON.parse(JSON.stringify(profileInfo))
    for (let i = 0; i < duplicate.length; i++) {
        duplicate[i].score = duplicate[i].userName.split(" ")[duplicate[i].userName.split(" ").length - 1]
    }
    duplicate = duplicate.sort((a, b) => a.score.localeCompare(b.score))
    let staffInfo = await User.find({
        $or: [
            {
                workEmail: {
                    $in: special
                }
            },
            {
                googleemail: {
                    $in: special
                }
            }]
    }).sort({userName: -1})
    try {
        res.render('./pages/showFacultyList', {
            profileInfo: duplicate,
            staffInfo: staffInfo
        })
    } catch (e) {
        next(e)
    }
}
//
// exports.assignSpecialtyAreas = async (req, res, next) => {
//     let userId = await User.findOne({_id: req.params.userId})
//     try {
//         let resources = Resource.find({ownerId: userId}, {
//             'tags': 1
//         })
//         if (resources) {
//             for (let i = 0; i < resources.length; i++) {
//                 resources[i]
//             }
//         }
//         userToUpdate.profilePicURL = req.body.imageURL;
//         await userToUpdate.save()
//         res.redirect('back')
//     } catch (e) {
//         next(e)
//     }
// }
