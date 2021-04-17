// require("dotenv").config();
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const admin = require("firebase-admin");
// const serviceAccount = require("./apt-price-checker-firebase-adminsdk-1b0ds-9eb0cba842.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();
const nightmare = require("nightmare")();
const args = process.argv.slice(2);
const url = args[0];

/*
  https://www.avaloncommunities.com/new-york/brooklyn-apartments/avalon-willoughby-square/apartments?bedroom=0BD
  https://www.avaloncommunities.com/new-york/brooklyn-apartments/ava-dobro/apartments?bedroom=0BD
  https://www.avaloncommunities.com/new-york/brooklyn-apartments/ava-fort-greene/apartments?bedroom=0BD
*/

checkPrice();

function update(result) {
  for (let item of result) {
    updatedb(item);
    console.log(item);
  }
  console.log("done");
}

async function updatedb(item) {
  const docRef = db.collection("apt-price");
  await docRef.doc(item.aptno).set({
    createdAt: Date.now(),
    availability: item.availability,
    detail: item.detail,
    price: item.price,
  });
}
async function checkPrice() {
  try {
    const result = await nightmare
      .goto(url)
      .wait(".apartment-cards")
      .evaluate(() => {
        var elements = [];
        var price = Array.from(document.getElementsByClassName("price"));
        var details = Array.from(document.getElementsByClassName("details"));
        var avail = Array.from(document.getElementsByClassName("availability"));
        var title = Array.from(document.getElementsByClassName("title"));

        elements = price.map((p, i) => {
          return {
            price: p.innerText,
            detail: details[i].innerText,
            availability: avail[i].innerText,
            aptno: title[i].innerText,
          };
        });

        return elements;
      })
      .end()
      .then((title) => {
        console.log(title);
      });
    // console.log(result);
    // update(result);
  } catch (e) {
    console.log(e.message);
    throw e;
  }
}
