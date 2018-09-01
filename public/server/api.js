const dotenv = require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');

var LINQ = require('node-linq').LINQ;

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products,read_orders';

var router = express.Router();
var app = express();
var host = server.address().address;
const forwardingAddress = host; // Replace this with your HTTPS Forwarding address

let response = {
    status:200,
    message:null,
    data:[]
}

let shopifyApp = {
    accessToken: null,
    shop: null
};

let setToken = function(token){
    shopifyApp.accessToken = token;
}

let setShop = function(shop){
    shopifyApp.shop = shop;
}

let getShopifyAppInfo = function(){
    return shopifyApp;
}

let getInfosAndToken = function(shop, res){
    if (shop) {
      const state = nonce();
      console.log(forwardingAddress);
      const redirectUri = forwardingAddress + 'api/shopify/callback';
      const installUrl = 'https://' + shop +
        '/admin/oauth/authorize?client_id=' + apiKey +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;
  
      res.cookie('state', state);
      res.redirect(installUrl);
    } else {
      return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
}

router.get('/shopify', (req, res) => {
    const shop = req.query.shop;
    setShop(shop);
    return getInfosAndToken(shop, res);
  });

router.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;

    if (state !== stateCookie) {
        return res.status(403).send('Request origin cannot be verified');
    }

    if (shop && hmac && code) {
        // DONE: Validate request is from Shopify
        const map = Object.assign({}, req.query);
        delete map['signature'];
        delete map['hmac'];
        const message = querystring.stringify(map);
        const providedHmac = Buffer.from(hmac, 'utf-8');
        const generatedHash = Buffer.from(
        crypto
            .createHmac('sha256', apiSecret)
            .update(message)
            .digest('hex'),
            'utf-8'
        );
        let hashEquals = false;

        try {
            hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
        } catch (e) {
            hashEquals = false;
        };

        if (!hashEquals) {
            return res.status(400).send('HMAC validation failed');
        }

        // DONE: Exchange temporary code for a permanent access token
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        };

        request.post(accessTokenRequestUrl, { json: accessTokenPayload })
        .then((accessTokenResponse) => {
            const accessToken = accessTokenResponse.access_token;
            setToken(accessToken);
            res.redirect('/');
        })
        .catch((error) => {
            res.status(error.statusCode).send(error.error.error_description);
        });
    } else {
        res.status(400).send('Required parameters missing');
    }
});

router.get('/ventes', (req, res) => {
    var produitFiltrer = req.query.produit;
    
    var infos = getShopifyAppInfo();
    infos.produitFiltrer = produitFiltrer;

    var orders = [];

    if(infos.accessToken == null){
        getInfosAndToken(infos.shop, res);
    }

    // Use access token to make API call to 'shop' endpoint
    infos.shopOrdersCountUrl = 'https://' + infos.shop + '/admin/orders/count.json?status=any';
    infos.shopRequestHeaders = {'X-Shopify-Access-Token': infos.accessToken,};

    request.get(infos.shopOrdersCountUrl, { headers: infos.shopRequestHeaders })
    .then((shopResponse) => {
        //console.log(shopResponse);
        var jsonReponse = JSON.parse(shopResponse);
        var total = jsonReponse.count;
        sendOrders(res, infos, [], 1, 0, total);
    })
    .catch((error) => {
        res.status(error.statusCode).send(error.error);
    });
});

var nombreOrder = function(shopResponse){
    var jsonReponse = JSON.parse(shopResponse);
    return jsonReponse.orders.length;
}

var sendOrders = function(res, infos, orders, page, total, totalReel){
    var limit = totalReel - total > 250 ? 250 : totalReel - total;
    const shopOrdersUrl = 'https://' + infos.shop + '/admin/orders.json?status=any&page=' + page +'&limit=' + limit;
    //console.log(shopOrdersUrl);
    request.get(shopOrdersUrl, { headers: infos.shopRequestHeaders })
    .then((shopResponse) => {
        total += nombreOrder(shopResponse);

        var newOrders = createOrder(shopResponse, infos.produitFiltrer);
        orders = orders.concat(newOrders);

        if(total >= totalReel){
            var finalOrders = createMultipleOrder(orders);
            res.send(finalOrders);
        } else {
            var nextPage = page + 1;
            sendOrders(res, infos, orders, nextPage, total, totalReel)
        }
    });
} 

var createOrder = function(shopResponse, produitFiltrer){
    var jsonReponse = JSON.parse(shopResponse);

    var orders = jsonReponse.orders.map(function(order){
        //console.log(order);
        return {
            noCommande : order.name,
            quantite : obtenirQuantite(order, produitFiltrer),
            produits: order.line_items.map(function(item){
                return item.title;
            }),
            nom : order.customer ? order.customer.first_name : null,
            prenom : order.customer ? order.customer.last_name : null,
            email : order.email,
            adresse : order.billing_address ? order.billing_address.address1 : null,
            ville : order.billing_address ? order.billing_address.city : null,
            telephone: order.billing_address ? order.billing_address.phone : null,
            dateAchat : order.created_at,
            infoLettre: order.buyer_accepts_marketing
        };
    });

    return orders;
}

var createMultipleOrder = function(orders){
    
    function removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    var orders = removeDuplicates(orders, 'noCommande');

    //Dupliquer les rows avec plus de 2 quantités
    var ordersProduct = [];
    orders.forEach(function(order){
        //console.log(order.noCommande, order.quantite);
        if(order.quantite > 1){
            for(var i = 1; i <= order.quantite; i++){
                var duplicateOrder = JSON.parse(JSON.stringify(order));
                duplicateOrder.noCommande += "-" + i  
                ordersProduct.push(duplicateOrder);
            }
        } else if(order.quantite == 1) {
            var duplicateOrder = JSON.parse(JSON.stringify(order));
            ordersProduct.push(duplicateOrder);
        }
    })

    return ordersProduct;
}

var obtenirQuantite = function(order, produit){
    
    var line_items = order.line_items.filter(function(items){
        return items.title == produit 
    });

    if(line_items.length == 0) return 0;
    return line_items[0].quantity;
}

var sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == "object" ? err.message : err;
    res.status(501).json(response);
}


module.exports = router;