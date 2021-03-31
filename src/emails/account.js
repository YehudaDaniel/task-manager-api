const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'h10ytguf@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let us know how you get along with the app`,

    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'h10ytguf@gmail.com',
        subject: 'Account cancelation',
        text: 'We are sorry to hear you canceled your account, we would appreciate for you to send us feedback about that.'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail

}