/**
 * @swagger
 * /posts/followings:
 *   get:
 *     summary: Retrieve posts from followed users
 *     description: Retrieve posts from users followed by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Post_Followings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       '400':
 *         description: No posts found for the followed users or not following anyone
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: No posts found for the following users.
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User not found.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         privacy:
 *           type: string
 *         commentsStatus:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const express = require('express');
const Joi = require('joi');
const ensureAuth = require('../../../middlewares/auth');
const User = require('../../../models/userModel');
const Post = require('../../../models/postModel');
const Follow = require('../../../models/followModel');
const router = express.Router();


router.get('/', ensureAuth(), async(req, res) => {
    try{
        const user = await User.findById(req.user.id);
        const userFollowings = await Follow.find({follower : req.user.id})
        if(!userFollowings.length > 0){
            return res.status(400).send(`You are not following anyone.`)
        };
        const followingIds = userFollowings.map(following => following.user);

        const posts = await Post.find({ userId: { $in: followingIds }}).sort({createdAt : -1})

        if (posts.length > 0) {
            return res.status(400).send(`No posts found for the following users.`);
        }
        return res.status(200).json({Post_Followings : posts});

    }catch(err){
        console.log(err);
        res.send('Server error.')
    }
});



module.exports = router;