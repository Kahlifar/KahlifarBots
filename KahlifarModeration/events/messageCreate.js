const { Message, MessageEmbed, MessageActionRow, MessageButton, Interaction } = require("discord.js")
const logger = require("../handlers/logger")
const { isBanned, isReplying } = require("../helpers/modmail")
const { sendError } = require("../helpers/send")
const data = require(`${process.cwd()}/properties.json`)
const client = require("../index")

client.on("messageCreate", async message => {
    try {
        if (message.channel.type == "DM" && !message.author.bot) {
            if (await isReplying(message.author.id)) return
            if (!await isBanned(message.author.id)) {
                let filter = (interaction) => interaction.customId === 'modmailconfirmation' && interaction.user.id !== client.user.id
                let modMailConfirmationEmbed = new MessageEmbed()
                    .setTitle("Mod Mail Confirmation")
                    .setDescription('⚠ **- Are you sure you wanna send this to the Modmail**')
                    .setColor(data.helpers.send.colors.warning)
                    .setFields([
                        {
                            name: "Your Content",
                            value: message.content
                        }
                    ])
                let row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId("modmailconfirmation")
                            .setEmoji("<:mcaccept:923008500483899392>")
                            .setStyle("SUCCESS"),
                        new MessageButton()
                            .setCustomId("modmaildeny")
                            .setEmoji("<:mcdeny:923008528103374898> ")
                            .setStyle("DANGER")
                    )
                await message.author.send({ embeds: [modMailConfirmationEmbed], components: [row] })
                message.channel.awaitMessageComponent(filter, {
                    time: 1000,
                })
                    .then(interaction => {
                        if (interaction.customId === "modmailconfirmation") {
                            let revievedEmbed = new MessageEmbed()
                                .setTitle("New Message from ModMail")
                                .setDescription(`<@${message.author.id}> has sent a new Message.`)
                                .setColor(data.events.modmail.embedColor)
                                .setTimestamp()
                                .setFields([
                                    {
                                        name: `Message from ${message.author.tag}`,
                                        value: message.content
                                    }
                                ])

                            let row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId("modmailreply")
                                        .setLabel("↩ Reply")
                                        .setStyle("PRIMARY"),
                                    new MessageButton()
                                        .setCustomId("modmailspam")
                                        .setLabel("⛔ Spam")
                                        .setStyle("DANGER"),
                                    new MessageButton()
                                        .setCustomId("modmaildelete")
                                        .setLabel("🗑 Delete")
                                        .setStyle("DANGER"),
                                )
                            client.channels.cache.get(data.events.modmail.channel).send({ content: `<@&${data.events.modmail.pingrole}>`, embeds: [revievedEmbed], components: [row] })
                            interaction.reply({ content: "📨 - Your Mail **has** been sent to the Modmail\n*Please be patient you will get an answer soon.*", ephemeral: true })
                        }
                    })
                    .catch((e) => {
                        console.error(e)
                    })
            } else {
                sendError(message, "You are banned from using the Modmail", true, false)
            }

        }
        // console.info(message.author.displayName + "Has send a message with the value\n" + message.content);
    } catch (e) {
        logger.error(e)
    }
})