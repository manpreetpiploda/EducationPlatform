import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

const mailSender = async (email, title, body) => {
    try{
            // let transporter = nodemailer.createTransport({
            //     host:process.env.MAIL_HOST,
            //     auth:{
            //         user: process.env.MAIL_USER,
            //         pass: process.env.MAIL_PASS,
            //     }
            // })
            console.log("inside mailsender " );
            const transporter = nodemailer.createTransport({
                
                host: process.env.MAIL_HOST,
                port: 587, // or 465 for secure connection (SSL)
                secure: false, // use true for SSL
                auth: {
                  user: process.env.MAIL_USER,
                  pass: process.env.MAIL_PASS
                }
              });

              console.log("mailsender mail is sending" );
            let info = await transporter.sendMail({
                from: 'StudyNotion ',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log("mailsender mail is send" );
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
};

export {mailSender};
