const fs = require("fs");

const createDirectory = async() => {
    try {
        const public = "./public"
        const upload = public + "/uploads"

        // public
        if (!fs.existsSync(public)) {
            fs.mkdirSync(public, { recursive: true });
            console.log(`Create recursive : ${public}`);
        }

        // uploads
        if (!fs.existsSync(upload)) {
            fs.mkdirSync(upload);
            console.log(`Create : ${upload}`);
        }

    } catch (err) {
        console.log(`Error : ${err}`);
        process.exit(1);
    }
};

createDirectory()