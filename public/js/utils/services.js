define(["angular", "btford.socket-io"], function (angular) {
  "use strict";

  return angular.module("utils.services", ["btford.socket-io"])
    .filter("toArray", function () {
      return function (obj) {
        if (!(obj instanceof Object)) {
          return obj;
        }
        return Object.keys(obj).filter(function(key){if(key.charAt(0) !== "$") {return key;}}).map(function (key) {
          return Object.defineProperty(obj[key], "$key", {__proto__: null, value: key});
        });
      };
    })
    .filter("pickOrderBy", function () {
      return function (input, order, king) {
        for (var i = 0, ii = order.length, preKing = [], postKing = []; i < ii; i++) {
          var name = order[i].nickname;
          if (name == king || postKing.length > 0) {
            for (var j = 0, jj = input.length; j < jj; j++) {
              if (input[j].nickname == name) {
                postKing.push(input[j]);
                break;
              }
            }
          }
          else {
            for (var j = 0, jj = input.length; j < jj; j++) {
              if (input[j].nickname == name) {
                preKing.push(input[j]);
                break;
              }
            }
          }
        }
        return postKing.concat(preKing);
      };
    })
    .factory("socket", ["socketFactory", function (socketFactory) {
      return socketFactory({
        ioSocket: io.connect("http://localhost", {port: 5000, transports: ["websocket"]})
      });
    }])
    .factory("appFactory", function () {
      return  {
        socketConnected: false,
        player: {
          nickname: ""
        },
        remotePlayers: {},
        remoteRooms: {}
      };
    })
    .factory("gameFactory", ["$filter", function ($filter) {
      return {
        init: function () {
          angular.extend(this, {
            gameLog: "This is the game log.\n",
            roomName: "",
            nickname: "",
            currentCharacter: {},
            gold: 0,
            income: 0,
            districtHand: [],
            ownedDistricts: {},
            onTurn: false,
            buildCap: 1,
            buildTurn: false,
            players: {},
            order: [],
            chars: {},
            Laboratory: false,
            SchoolOfMagic: false,
            Smithy: false,
            collected: false,
            merchantCollected: false,
            architectDrew: false
          })
        },
        log: function log(str) {
          this.gameLog += $filter('date')(new Date(), 'h:mm:ss') + ": " + str + "\n";
        },
        gainGold: function (gold) {
          this.gold += gold;
        },
        gainDistrictHand: function (cards) {
          this.districtHand = this.districtHand.concat(cards);
        },
        buildDistrict: function (card) {
          this.ownedDistricts[card.name] = card;
          this.districtHand.splice(this.districtHand.indexOf(card), 1);
          this.gold -= card.cost;
          this.buildCap--;
        },
        isOwned: function (name) {
          return this.ownedDistricts[name];
        },
        calculateIncome: function () {
          if (this.currentCharacter) {
            var earnDistrictType;
            this.income = 0;
            switch (this.currentCharacter.rank) {
              case 4:
                earnDistrictType = "Noble";
                break;
              case 5:
                earnDistrictType = "Religious";
                break;
              case 6:
                earnDistrictType = "Trade";
                break;
              case 8:
                earnDistrictType = "Military";
                break;
            }
            if (earnDistrictType) {
              var districtKeys = Object.keys(this.ownedDistricts);
              for (var i = 0, ii = districtKeys.length; i < ii; i++) {
                if (this.ownedDistricts[districtKeys[i]].type == earnDistrictType)
                  this.income++;
              }
            }
          }
        },
        checkSpecialCards: function () {
          if (this.isOwned("School of Magic")) {
            this.SchoolOfMagic = true;
            this.log("You can choose the color of your School of Magic");
          }
          if (this.isOwned("Laboratory")) {
            this.Laboratory = true;
          }
          if (this.isOwned("Smithy")) {
            this.Smithy = true;
          }
        },
        reOrder: function (king) {
          this.king = king;
          for (var i = 0, ii = this.order.length, preKing = [], postKing = []; i < ii; i++) {
            var name = this.order[i].nickname;
            if (name == king || postKing.length > 0)
              postKing.push(this.order[i]);
            else
              preKing.push(this.order[i]);
          }
          this.order = postKing.concat(preKing);
        },
        getOwnedDistrctsLength: function (p) {
          if (!p)
            p = this;
          return Object.keys(p.ownedDistricts).length;

        },
        totalCost: function (p) {
          if (!p)
            p = this;
          for (var s = 0, k = Object.keys(p.ownedDistricts), i = 0, ii = k.length; i < ii; i++) {
            s += p.ownedDistricts[k[i]].cost;
          }
          p.totalCost = s;
          return s;
        },
        totalColor: function (p) {
          if (!p)
            p = this;
          for (var t = ["Noble", "Religious", "Trade", "Military", "Special"]
                 ,k = Object.keys(p.ownedDistricts),  i = 0, ii = k.length; i < ii; i++) {
            var index = t.indexOf(p.ownedDistricts[k[i]].type);
            if (index != -1) {
              t.splice(index, 1);
            }
          }
          return 5 - t.length;
        },
        charsToString: function  (chars) {
          for (var i = 0, ii = chars.length, str = ""; i < ii; i++) {
            str += chars[i].name + ", ";
          }
          return str.slice(0, -2);
        },
        cardsToString: function (cards) {
          for (var i = 0, ii = cards.length, str = ""; i < ii; i++) {
            str += cards[i].name + ", ";
          }
          return str.slice(0, -2);
        }
      };
    }])
});