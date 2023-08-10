import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import {EMAIL, PASSWORD} from ' mailer/routes/env';

const response = {
  body: {
    name: 'CICSIII',
    intro: 'Hello CICS',
    table: {
      data: [
        {
          item: 'hehehehe',
          description: 'hihihi',
          price: '2929php',
        },
      ],
    },
    outro: 'helooo00',
  },
};

export async function signup(req, res) {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    const message = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
      subject: 'Hello ✔',
      text: 'Hello world?',
      html: '<b>wasap burat</b>',
    };
    const info = await transporter.sendMail(message);

    return res.status(201).json({
      msg: 'you should receive an email',
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getBill(req, res) {
  try {
    const {userEmail} = req.body;
    const config = {
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(config);
    const MailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Mailgen',
        link: 'https://mailgen.js/',
      },
    });

    const mail = MailGenerator.generate(response);

    const message = {
      from: EMAIL,
      to: userEmail,
      subject: 'WATATA',
      html: mail,
    };

    transporter.sendMail(message);
    res.status(201).json({
      msg: 'You should receive an email',
    });

    res.status(201).json('getBill Successfully...!');
  } catch (err) {
    console.log(err);
  }
}
