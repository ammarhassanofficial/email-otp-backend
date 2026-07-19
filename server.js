const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

const otpDatabase = {}; 

// Gmail configuration (Aapka password yahan pehle se add hai)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hmahworkspace@gmail.com', // ⚠️ Idhar apni asli Gmail ID likhein
    pass: 'qnrw xiwd clbx elys'        // Aapka pehle wala password
  }
});

// API: OTP Bhejne Ke Liye
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email zaroori hai!");

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  otpDatabase[email] = {
    otp: generatedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000 
  };

  const mailOptions = {
    from: 'hmahworkspace@gmail.com', // ⚠️ Idhar bhi apni asli Gmail ID likhein
    to: email,
    subject: 'App Login OTP Code',
    text: `Aapka verification code hai: ${generatedOtp}. Ye sirf 5 mins ke liye valid hai.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Email nahi gayi: " + error.message);
    }
    res.status(200).send("OTP successfully bhej diya gaya hai!");
  });
});

// API: OTP Verify Karne Ke Liye
app.post('/api/verify-otp', (req, res) => {
  const { email, userOtp } = req.body;
  const record = otpDatabase[email];

  if (!record) return res.status(400).send("Pehle OTP request karein!");
  if (Date.now() > record.expiresAt) return res.status(400).send("OTP expire ho chuka hai!");
  if (record.otp !== userOtp) return res.status(400).send("Ghalat OTP code!");

  delete otpDatabase[email]; 
  res.status(200).send("Verification Successful! Aap login ho chuke hain.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));