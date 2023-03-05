/* eslint-disable no-console */
const router = require("express").Router();


/**
 * @swagger
 * /email/otp:
 *   post:
 *     tags:
 *       - OTP
 *     name: Send OTP to Email
 *     summary: Send OTP to Email
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             type:
 *               type: string
 *         required:
 *           - email
 *           - type
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Details'
 *               type: object
 *               properties:
 *                Status:
 *                  type: string
 *                Details:
 *                  type: string
 *       '400':
 *         description: Either Email is not provided or Type is not provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Details'
 *               type: object
 *               properties:
 *                Status:
 *                  type: string
 *                Details:
 *                  type: string
 * 
 *       
 */

// To add minutes to the current time



module.exports = router;
