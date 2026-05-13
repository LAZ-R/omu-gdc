import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { APP_BASE_PATH, APP_ORIGIN } from "../../router.js";
import { updateMenuDom } from "../../services/menu.service.js";
import { getUser, setUser } from "../../services/storage.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";
import { getAdaptiveVerboseTimeStringByMilliseconds } from "../../utils/dateAndTime.utils.js";
import { getRandomIntegerBetween } from "../../utils/math.utils.js";

const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');

// Global parameters //////////////////////////////////////////////////////////////////////////////
const PRESTATIONS = [
  {
    id: 0,
    name: 'Maquillage mariée naturel + 1 essai',
    price: 75,
  },
  {
    id: 1,
    name: 'Maquillage mariée sophistiqué + 1 essai',
    price: 95,
  },
  {
    id: 2,
    name: 'Forfait Mariée maquillage naturel et coiffure lâchée + 1 essai',
    price: 104,
  },
  {
    id: 3,
    name: 'Forfait Mariée maquillage naturel et coiffure attachée + 1 essai',
    price: 114,
  },
  {
    id: 4,
    name: 'Forfait Mariée maquillage sophistiqué et coiffure lâchée + 1 essai',
    price: 124,
  },
  {
    id: 5,
    name: 'Forfait Mariée maquillage sophistiqué et coiffure attachée + 1 essai',
    price: 134,
  },
  {
    id: 6,
    name: 'Maquillage Invitée',
    price: 29,
  },
  {
    id: 6,
    name: 'Coiffure Invitée',
    price: 29,
  },
  {
    id: 8,
    name: 'Forfait Invitée',
    price: 49,
  },
];

const user = getUser();

let CIVILITY = 'Mme';

let ESTIMATE_NUMBER = user.PREVIOUS_ESTIMATE_NUMBER;
let CURRENT_DATE = new Date().toLocaleDateString();
let CLIENT_NAME = 'Cliente';
let ADRESS = 'Adresse 1';
let POSTAL_CODE = 'Code postal';
let CITY = 'Ville';
let PHONE_NUMBER = 'Numéro de téléphone';
let TRAVEL_EXPENSES = false;
let TRAVEL_EXPENSES_PRICE = 0.45;
let TRAVEL_DISTANCE_TRY = 0;
let TRAVEL_DISTANCE_PRESTA = 0;
let TRY_CITY = 0;
let PRESTA_CITY = 0;
let PRESTA_DATE = null;
let GLOBAL_TOTAL = 0;

let ESTIMATE_PRESTATIONS = [
  {
    prestation: PRESTATIONS[0],
    quantity: 1,
  },
];

// VIEW RENDER ////////////////////////////////////////////////////////////////////////////////////

export function render() {
  let user = getUser();
  // Set MAIN layout
  MAIN.innerHTML = `
    <img class="main-logo" src="${APP_BASE_PATH}assets/medias/images/LOGO_OPALE_MAKEUP_fond_blanc.png" />

    <h1>Générateur de devis et contrats</h1>
    <span class="version-number">v ${APP_VERSION}</span>
    <div id="formContainer" class="page-container">
      <div class="input-block">
        <span class="input-title">N° du devis (précédent devis : <span id="previousNumber">${user.PREVIOUS_ESTIMATE_NUMBER}</span>)</span>
        <input type="text" oninput="onEstimateNumberChange(event)" />
      </div>

      <div class="input-block">
        <span class="input-title">Nom du client</span>
        <div class="input-line">
          <select onchange="onCivilityChange(event)">
            <option>Mme</option>
            <option>M.</option>
          </select>
          <input type="text" oninput="onClientNameChange(event)" />
        </div>
      </div>

      <div class="input-block">
        <span class="input-title">Adresse</span>
        <input type="text" oninput="onAdressChange(event)" />
      </div>

      <div class="input-block">
        <span class="input-title">Code postal</span>
        <input type="text" oninput="onPostalCodeChange(event)" />
      </div>

      <div class="input-block">
        <span class="input-title">Ville</span>
        <input id="globalCityInput" type="text" oninput="onCityChange(event)" />
      </div>

      <div class="input-block">
        <span class="input-title">N° de téléphone</span>
        <input type="text" oninput="onPhoneNumberChange(event)" />
      </div>

      <div class="input-block">
        <span class="input-title">Prestations</span>
        <div id="prestasSelectorContainer" class="prestas-selector-container">
          ${getPrestaSelectLineDom()}
        </div>
        <button class="add-presta-button" onclick="onAddPrestaClick()">Ajouter une prestation</button>
      </div>

      <div class="input-block">
        <span class="input-title">Date de la prestation</span>
        <input type="date" onchange="onPrestaDateChange(event)" />
      </div>

      <div class="travel-expenses-input-block">
        <div class="checkbox-line">
          <input id="travelExpenseCheckbox" type="checkbox" onchange="onTravelExpensesChange(event)" />
          <label for="travelExpenseCheckbox" class="input-title">Frais de déplacement</label>
        </div>

        <div id="travelHiddenContainer" class="travel-hidden-block hidden">
          <div class="travel-price-block">
            <div class="price-line">
              <span class="price-title">Prix au km</span>
              <input type="number" value="${TRAVEL_EXPENSES_PRICE}" oninput="onTravelPriceChange(event)" />
              <span>€</span>
            </div>
          </div>
          <div class="travel-distances-container">
            <div class="travel-distance-block">
              <strong class="distance-title">Essai</strong>
              <div class="distance-line">
                <span class="distance-title">Ville</span>
                <input type="text" oninput="onTryCityChange(event)" style="width: 100%;" />
                <div class="vertical-separator"></div>
                <span class="distance-title">Distance</span>
                <input type="number" oninput="onTryDistanceChange(event)" />
                <span>km</span>
              </div>
            </div>
            <div class="travel-distance-block">
              <strong class="distance-title">Jour J</strong>
              <div class="distance-line">
                <span class="distance-title">Ville</span>
                <input type="text" oninput="onPrestaCityChange(event)" style="width: 100%;" />
                <div class="vertical-separator"></div>
                <span class="distance-title">Distance</span>
                <input type="number" oninput="onPrestaDistanceChange(event)" />
                <span>km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="generate-button" onclick="onGenerateClick()">Générer Devis + Contrat</button>
    </div>
  `;

}

function getPrestaSelectLineDom() {
  let str = `
    <div class="presta-line">
      <select id="selectPresta${ESTIMATE_PRESTATIONS.length - 1}" onchange="onPrestaChange(event)">
      <button>
        <selectedcontent></selectedcontent>
      </button>
    `;
  for (const presta of PRESTATIONS) {
    str += `<option value="${presta.id}">${presta.name}</option>`;
  }
  str += `</select><select id="selectQuantity${ESTIMATE_PRESTATIONS.length - 1}" onchange="onQuantityChange(event)">`;
  for (let index = 0; index < 5; index++) {
    str += `<option value="${index + 1}">${index + 1}</option>`;
  }
  str += '</select></div>';
  return str;
}

function onAddPrestaClick() {
  ESTIMATE_PRESTATIONS.push(
    {
      prestation: PRESTATIONS[0],
      quantity: 1,
    }
  );
  document.getElementById('prestasSelectorContainer').insertAdjacentHTML('beforeend', `${getPrestaSelectLineDom()}`);
}
window.onAddPrestaClick = onAddPrestaClick;

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');

  return cleaned.replace(/(\d{2})(?=\d)/g, '$1.');
}

function onPrestaChange(event) {
  console.log(event.target.id);
  console.log(`ESTIMATE_PRESTATIONS[${event.target.id[event.target.id.length - 1]}]`)
  const arrayPresta = ESTIMATE_PRESTATIONS[event.target.id[event.target.id.length - 1]];
  console.log(arrayPresta);

  const basePresta = PRESTATIONS[event.target.value];
  console.log(basePresta.name)
  arrayPresta.prestation = basePresta;
}
window.onPrestaChange = onPrestaChange;

function onQuantityChange(event) {
  console.log(event.target.id);
  const arrayPresta = ESTIMATE_PRESTATIONS[event.target.id[event.target.id.length - 1]];

  arrayPresta.quantity = Number(event.target.value);
}
window.onQuantityChange = onQuantityChange;

function onEstimateNumberChange(event) {
  ESTIMATE_NUMBER = event.target.value;
}
window.onEstimateNumberChange = onEstimateNumberChange;

function onCivilityChange(event) {
  CIVILITY = event.target.value;
}
window.onCivilityChange = onCivilityChange;

function onClientNameChange(event) {
  CLIENT_NAME = event.target.value;
}
window.onClientNameChange = onClientNameChange;

function onAdressChange(event) {
  ADRESS = event.target.value;
}
window.onAdressChange = onAdressChange;

async function onPostalCodeChange(event) {
  POSTAL_CODE = event.target.value;
  let response = 
  fetch(`https://geo.api.gouv.fr/communes?codePostal=${POSTAL_CODE}`)
  .then(res => res.json())
  .then(data => {
    if (data.length == 0) {
      CITY = '';
    } else {
      CITY = data[0].nom;
    }
    document.getElementById('globalCityInput').value = CITY;
  })
  .catch(err => {
    console.log(err);
  });
}
window.onPostalCodeChange = onPostalCodeChange;

function onCityChange(event) {
  CITY = event.target.value;
}
window.onCityChange = onCityChange;

function onPhoneNumberChange(event) {
  PHONE_NUMBER = event.target.value;
}
window.onPhoneNumberChange = onPhoneNumberChange;

function onPrestaDateChange(event) {
  console.log(event.target.value);
  PRESTA_DATE = new Date(event.target.value).toLocaleDateString();
}
window.onPrestaDateChange = onPrestaDateChange;

function onTravelExpensesChange(event) {
  TRAVEL_EXPENSES = event.target.checked;

  if (TRAVEL_EXPENSES) {
    document.getElementById('travelHiddenContainer').classList.remove('hidden');
  } else {
    TRAVEL_DISTANCE_TRY = 0;
    TRAVEL_DISTANCE_PRESTA = 0;
    document.getElementById('travelHiddenContainer').classList.add('hidden');
  }
}
window.onTravelExpensesChange = onTravelExpensesChange;

function onTryCityChange(event) {
  TRY_CITY = event.target.value;
}
window.onTryCityChange = onTryCityChange;

function onTryDistanceChange(event) {
  TRAVEL_DISTANCE_TRY = Number(event.target.value);
}
window.onTryDistanceChange = onTryDistanceChange;

function onPrestaCityChange(event) {
  PRESTA_CITY = event.target.value;
}
window.onPrestaCityChange = onPrestaCityChange;

function onPrestaDistanceChange(event) {
  TRAVEL_DISTANCE_PRESTA = Number(event.target.value);
}
window.onPrestaDistanceChange = onPrestaDistanceChange;

function getPrestationsArrayDom() {
  GLOBAL_TOTAL = 0;
  let prestaTotal = 0;
  let str = `<div class="prestas-array-block"><table class="presta-table">`;
  // Entête prestas
  str += `
    <tr class="prestation-array-line">
      <th class="array-block dark block-1">Prestation</th>
      <th class="array-block dark block-2">Prix unitaire</th>
      <th class="array-block dark block-3">Quantité</th>
      <th class="array-block dark block-4">Total</th>
    </tr>
  `;
  // Lignes prestas
  for (let presta of ESTIMATE_PRESTATIONS) {
    let total = presta.prestation.price * presta.quantity;
    prestaTotal += total;
    str += `
      <tr class="prestation-array-line">
        <td class="array-block block-1">${presta.prestation.name}</td>
        <td class="array-block block-2">${presta.prestation.price.toFixed(2)}</td>
        <td class="array-block block-3">${presta.quantity}</td>
        <td class="array-block block-4">${total.toFixed(2)}</td>
      </tr>
    `;
  }
  GLOBAL_TOTAL += prestaTotal;

  // Lignes vides
  for (let index = 0; index < 2; index++) {
    str += `
      <tr class="prestation-array-line">
        <td class="array-block empty block-1">0</td>
        <td class="array-block empty block-2">0</td>
        <td class="array-block empty block-3">0</td>
        <td class="array-block empty block-4">0</td>
      </tr>
    `;
  }

  // Frais déplacement
  if (TRAVEL_EXPENSES) {
    let travelTotal = 0;
    const travelTryTotal = TRAVEL_EXPENSES_PRICE * TRAVEL_DISTANCE_TRY;
    travelTotal += travelTryTotal;
    const travelPrestaTotal = TRAVEL_EXPENSES_PRICE * TRAVEL_DISTANCE_PRESTA;
    travelTotal += travelPrestaTotal;
    GLOBAL_TOTAL += travelTotal;

    str += `
      <tr class="prestation-array-line">
        <th class="array-block dark block-1">Frais de déplacement</th>
        <th class="array-block dark block-2">Prix au km</th>
        <th class="array-block dark block-3">km</th>
        <th class="array-block dark block-4">Total</th>
      </tr>
    `;
    str += `
      <tr class="prestation-array-line">
        <td class="array-block block-1">Essai - ${TRY_CITY}</td>
        <td class="array-block block-2">${TRAVEL_EXPENSES_PRICE.toFixed(2)}</td>
        <td class="array-block block-3">${TRAVEL_DISTANCE_TRY}</td>
        <td class="array-block block-4">${travelTryTotal.toFixed(2)}</td>
      </tr>
    `;
    str += `
      <tr class="prestation-array-line">
        <td class="array-block block-1">Jour j - ${PRESTA_CITY}</td>
        <td class="array-block block-2">${TRAVEL_EXPENSES_PRICE.toFixed(2)}</td>
        <td class="array-block block-3">${TRAVEL_DISTANCE_PRESTA}</td>
        <td class="array-block block-4">${travelPrestaTotal.toFixed(2)}</td>
      </tr>
    `;
  }

  // Net à payer
  str += `
    <tr class="prestation-array-line">
      <td class="array-block transparent empty block-1"></td>
      <td class="array-block transparent empty block-2">0</td>
      <td class="array-block transparent block-3" style="font-weight: 600;">Net à payer</td>
      <td class="array-block outline block-4" style="font-weight: 600;">${GLOBAL_TOTAL.toFixed(2)} €</td>
    </tr>
  `;
  str += `
      </table>
      <div class="tva">TVA non applicable, art 293 du CGI</div>
    </div>
  `;

  return str;
}

async function onGenerateClick() {
  document.getElementById('popUp').classList.remove('hidden');
  MAIN.classList.add('hidden');
  const a4Page1 = document.getElementById('a4Page1');
  a4Page1.innerHTML = `
    <div class="top-block">
      <img src="${APP_BASE_PATH}assets/medias/images/LOGO_OPALE_MAKEUP_fond_blanc.png" />
      <div class="estimate-identification-block">
        <span style="font-weight: 600;">Devis n°${ESTIMATE_NUMBER}</span>
        <span>${CURRENT_DATE}</span>
      </div>
    </div>

    <div class="header-block">
      <div class="header-block-left">
        <span>Matthieu Duquenoy</span>
        <span>1905 rue du 28 septembre</span>
        <span>62730 MARCK</span>
        <span>06.67.70.96.02</span>
        <span>CONTACT.OPALEMAKEUP@GMAIL.COM</span>
      </div>
      <div class="header-block-right">
        <span>${CIVILITY} ${CLIENT_NAME}</span>
        <span>${ADRESS}</span>
        <span>${POSTAL_CODE} ${CITY}</span>
        <span>${formatPhoneNumber(PHONE_NUMBER)}</span>
      </div>
    </div>

    ${getPrestationsArrayDom()}


    <div class="payment-block">
      <span>Moyens de paiement acceptés : Carte bancaire, chèque, espèces, virement</span>
      <span>Durée de validité du devis : 1 mois</span>
    </div>
    <div class="agreement-block">
      <div class="agreement-enterprise">
        <span>L'entreprise: "Lu et accepté"</span>
        <span>Date : ${CURRENT_DATE}</span>
        <div class="sign-area page1">
          <img class="sign-image" src="${APP_BASE_PATH}assets/medias/images/sign.png" />
          <img class="accept-image" src="${APP_BASE_PATH}assets/medias/images/accept.png" />
        </div>
      </div>
      <div class="agreement-client">
        <span>Le client: "Bon pour accord"</span>
        <span>Date :</span>
      </div>
    </div>
    <div class="credits-block">
      <span>Assurance La Maif 79000 Niort</span>
      <span>Entreprise individuelle Opale Makeup - RCS Calais 949 738 124 - Micro Entreprise</span>
      <span>Siret : 947 738 124 00013</span>
    </div>
  `;

  let prestaTotal = 0;

  for (let presta of ESTIMATE_PRESTATIONS) {
    let total = presta.prestation.price * presta.quantity;
    prestaTotal += total;
  }

  const a4Page2 = document.getElementById('a4Page2');
  a4Page2.innerHTML = `
    <div class="top-block">
      <img src="${APP_BASE_PATH}assets/medias/images/LOGO_OPALE_MAKEUP_fond_blanc.png" />
      <div class="estimate-identification-block service">
      <span style="font-weight: 600;">Contrat de prestation de services</span>
      <span>Joint au devis n°${ESTIMATE_NUMBER}</span>
      </div>
    </div>

    <div class="header-block">
      <div class="header-block-left">
        <span>Matthieu Duquenoy</span>
        <span>1905 rue du 28 septembre</span>
        <span>62730 MARCK</span>
        <span>06.67.70.96.02</span>
        <span>CONTACT.OPALEMAKEUP@GMAIL.COM</span>
      </div>
      <div class="header-block-right">
        <span>${CIVILITY} ${CLIENT_NAME}</span>
        <span>${ADRESS}</span>
        <span>${POSTAL_CODE} ${CITY}</span>
        <span>${formatPhoneNumber(PHONE_NUMBER)}</span>
      </div>
    </div>

    <div class="contract-text">
      <div class="paragraph-block">
        <strong>Objet</strong>
        <p>
        Le présent contrat a pour objet de définir les conditions de la 
        prestation de services suivante :
        </p>
        <span>Mise en beauté mariage le ${PRESTA_DATE}${TRAVEL_EXPENSES ? ` à ${PRESTA_CITY}` : ''}</span>
      </div>

      <div class="paragraph-block">
        <strong>Tarification</strong>
        <p>
        Coût total estimé de la prestation : <strong>${GLOBAL_TOTAL.toFixed(2)} €</strong>
        </p>
      </div>
      
      <div class="paragraph-block">
        <strong>Modalités de paiement</strong>
        <ul>
          <li>
            <strong>1. Paiement lors de l'essai :</strong>
            <p>
            Le client s'engage à régler un acompte minimum correspondant à 30% du montant de la prestation mariée${TRAVEL_EXPENSES ? ' + FRAIS DE DÉPLACEMENT JOUR DE L\'ESSAI' : ''}.
            </p>
          </li>
          <li>
            <strong>2. Solde du paiement pour le forfait marié :</strong>
            ${!TRAVEL_EXPENSES ? `
              <ul>
                <li>
                  <strong>Option 1 - Paiement total anticipé</strong>
                  <p>
                    Le client peut choisir de régler la totalité du montant de la prestation mariée le jour de l'essai.<br>
                    Dans ce cas, aucune autre somme ne sera due lors de la prestation finale concernant la prestation mariée.
                  </p>
                </li>
                <li>
                  <strong>Option 2 - Paiement partiel</strong>
                  <p>
                    Le client peut également choisir de régler uniquement l'acompte minimum de 30 % du montant de la prestation mariée lors de l'essai soit : <strong>${(ESTIMATE_PRESTATIONS[0].prestation.price * ESTIMATE_PRESTATIONS[0].quantity * .3).toFixed(2)} €</strong>.<br>
                    Le solde restant sera alors exigé le jour de la prestation finale soit : <strong>${(ESTIMATE_PRESTATIONS[0].prestation.price * ESTIMATE_PRESTATIONS[0].quantity * .7).toFixed(2)} €</strong>.
                  </p>
                </li>
              </ul>
            ` : `
              <ul>
                <li>
                  <strong>Option 1 - Paiement total anticipé</strong>
                  <p>
                    Le client peut choisir de régler la totalité du montant de la prestation mariée le jour de l'essai ainsi que les frais de déplacement essai et jour j.<br>
                    Dans ce cas, aucune autre somme ne sera due lors de la prestation finale concernant la prestation mariée ainsi que les frais des déplacement.
                  </p>
                </li>
                <li>
                  <strong>Option 2 - Paiement partiel</strong>
                  <p>
                    Le client peut également choisir de régler uniquement l'acompte minimum de 30 % du montant de la prestation mariée lors de l'essai soit : <strong>${(ESTIMATE_PRESTATIONS[0].prestation.price * ESTIMATE_PRESTATIONS[0].quantity * 0.3).toFixed(2)} €</strong> + les frais de déplacement du jour de l'essai soit : <strong>${(TRAVEL_DISTANCE_TRY * TRAVEL_EXPENSES_PRICE).toFixed(2)} €</strong>.<br>
                    Le solde restant sera alors exigé le jour de la prestation finale. Reste de la prestation mariée soit : <strong>${(ESTIMATE_PRESTATIONS[0].prestation.price * ESTIMATE_PRESTATIONS[0].quantity * 0.7).toFixed(2)} €</strong> + frais de déplacement du jour j soit : <strong>${(TRAVEL_DISTANCE_PRESTA * TRAVEL_EXPENSES_PRICE).toFixed(2)} €</strong>.
                  </p>
                </li>
              </ul>
            `}
          </li>
          ${ESTIMATE_PRESTATIONS.length > 1 ? `
            <li>
              <strong>3. Soldes des autres prestations :</strong>
              <p>
              Les autres prestations supplémentaires mentionnées dans le devis devront être
              réglées intégralement le jour de la prestation, sauf accord préalable entre 
              les parties.
              </p>
            </li>
            ` : ''}
          <li>
            <strong>${ESTIMATE_PRESTATIONS.length > 1 ? `4` : '3'}. Non-paiement :</strong>
            <p>
            En cas de non-paiement de l'acompte de 30% de la prestation Mariée le jour de l'essai, 
            l'essai pourra être annulé, et l'entreprise se réserve le droit d'annuler la 
            prestation complète.
            </p>
          </li>
        </ul>
      </div>

      <div class="paragraph-block">
        <strong>Conditions de paiement</strong>
        <p>
        En cas de retard de paiement, une pénalité de 50 % du montant initial sera appliquée.
        </p>
      </div>

      <div class="paragraph-block">
        <strong>Conditions d'utilisation</strong>
        <p>
        Annulation moins de deux semaines avant la prestation : 50 % du montant total du devis sera dû.<br>
        Annulation une semaine ou moins avant : la totalité du montant sera exigée.
        </p>
      </div>

      <div class="paragraph-block">
        <strong>Validation du contrat</strong>
        <p>
        La signature du présent contrat entraîne la validation de la prestation et la réservation du créneau.<br>
        <strong>
        La réservation de la date est effective dès la signature du devis et du contrat.<br>
        À ce titre, un acompte de 30 % du montant total de la prestation mariée est obligatoire et non remboursable, 
        y compris en cas d'annulation de la prestation par la cliente, quel que soit le délai avant la date du mariage.
        </strong>
        </p>
      </div>
    </div>

    
    <div class="agreement-block page2">
      <div class="agreement-enterprise">
        <span>Duquenoy Matthieu</span>
        <span>Date : ${CURRENT_DATE}</span>
        <div class="sign-area page2">
          <img class="sign-image" src="${APP_BASE_PATH}assets/medias/images/sign.png" />
          <img class="accept-image" src="${APP_BASE_PATH}assets/medias/images/accept.png" />
        </div>
      </div>
      <div class="agreement-client">
        <span>Le client: "Bon pour accord"</span>
        <span>Date :</span>
      </div>
    </div>
  `;

  let todayString = new Date().toLocaleDateString();
  let dateString = `${todayString[6]}${todayString[7]}${todayString[8]}${todayString[9]}-${todayString[3]}${todayString[4]}-${todayString[0]}${todayString[1]}`;
  const documentName = `Devis_${ESTIMATE_NUMBER}_${CLIENT_NAME}_${dateString}`;

  a4Page1.classList.remove('hidden');
  a4Page2.classList.remove('hidden');

  let user = getUser();
  user.PREVIOUS_ESTIMATE_NUMBER = ESTIMATE_NUMBER;
  setUser(user);

  await waitForImages();
  await Promise.all(
    [...document.images].map(img => img.decode())
  );
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 300));

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = 210;
  const pageHeight = 297;

  /* =========================
   PAGE 1
  ========================= */

  const canvas1 = await html2canvas(
    document.getElementById('a4Page1'),
    {
      scale: 2
    }
  );

  const imgData1 = canvas1.toDataURL('image/png');

  pdf.addImage(
    imgData1,
    'PNG',
    0,
    0,
    pageWidth,
    pageHeight
  );

  /* =========================
   PAGE 2
  ========================= */

  pdf.addPage();

  const canvas2 = await html2canvas(
    document.getElementById('a4Page2'),
    {
      scale: 2
    }
  );

  const imgData2 = canvas2.toDataURL('image/png');

  pdf.addImage(
    imgData2,
    'PNG',
    0,
    0,
    pageWidth,
    pageHeight
  );

  pdf.save(`${documentName}.pdf`);
  setTimeout(() => {
    a4Page1.classList.add('hidden');
    a4Page2.classList.add('hidden');
    MAIN.classList.remove('hidden');
    document.getElementById('popUp').classList.add('hidden');
    document.getElementById('previousNumber').innerHTML = getUser().PREVIOUS_ESTIMATE_NUMBER;
  }, 500);
}
window.onGenerateClick = onGenerateClick;

async function waitForImages() {

  const images = document.querySelectorAll('img');

  await Promise.all(
    [...images].map(img => {

      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });

    })
  );

}