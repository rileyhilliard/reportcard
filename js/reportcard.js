var __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  var cacheKey, hasLocalStorage, hourstl, ttl, value;
  hasLocalStorage = function() {
    var e, mod;
    mod = 'modernizr';
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch (_error) {
      e = _error;
      return false;
    }
  };
  if (!hasLocalStorage() || !options.localCache) {
    return;
  }
  hourstl = options.cacheTTL || 5;
  cacheKey = options.cacheKey || options.url.replace(/jQuery.*/, '') + options.type + (options.data || '');
  if (options.isCacheValid && !options.isCacheValid()) {
    localStorage.removeItem(cacheKey);
  }
  ttl = localStorage.getItem(cacheKey + 'cachettl');
  if (ttl && ttl < +(new Date)) {
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(cacheKey + 'cachettl');
    ttl = 'expired';
  }
  value = localStorage.getItem(cacheKey);
  if (value) {
    if (options.dataType.indexOf('json') === 0) {
      value = JSON.parse(value);
    }
    options.success(value);
    jqXHR.abort();
  } else {
    if (options.success) {
      options.realsuccess = options.success;
    }
    options.success = function(data) {
      var e, strdata;
      strdata = data;
      if (this.dataType.indexOf('json') === 0) {
        strdata = JSON.stringify(data);
      }
      try {
        localStorage.setItem(cacheKey, strdata);
      } catch (_error) {
        e = _error;
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheKey + 'cachettl');
        if (options.cacheError) {
          options.cacheError(e, cacheKey, strdata);
        }
      }
      if (options.realsuccess) {
        options.realsuccess(data);
      }
    };
    if (!ttl || ttl === 'expired') {
      localStorage.setItem(cacheKey + 'cachettl', +(new Date) + 1000 * 60 * 60 * hourstl);
    }
  }
});


/* Reportcard.js */

(function($) {
  return $.fn.reportCard = function(options) {
    var Codeschool, ReportCard, Treehouse, cs, th, toThousands;
    toThousands = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    ReportCard = (function() {
      function ReportCard(params) {
        this.userName = params.userName, this.site = params.site, this.badgesAmount = params.badgesAmount, this.tooltips = params.tooltips;
      }

      ReportCard.prototype.build = function(data) {
        var html, lastBadges, liWidth;
        lastBadges = data.badges.slice(-options.badgesAmount);
        liWidth = (100 / (lastBadges.length + 1)) + "%";
        html = "<h2>I have passed " + data.badge_count + " lessons and scored " + (toThousands(data.points_total)) + " points at " + data.site + "!</h2>\n<p>Check out some of my last passed course content at the badges below: </p>\n<ul class=\"badges\">";
        lastBadges.forEach(function(badge) {
          return html += "<li style=\"width: " + liWidth + ";\" title=\"" + badge.label + "\">\n  <a href=\"" + data.profile_url + "\" target=\"_blank\" data-toggle=\"tooltip\" data-placement=\"top\" >\n    <img src=\"" + badge.icon_url + "\" alt=\"" + badge.label + "\"/>\n  </a>\n</li>";
        });
        html += "</ul>";
        options.$element.html(html);
        if (options.tooltips) {
          options.$element.each(function(i, el) {
            return $(el).find('li').tooltip();
          });
        }
      };

      ReportCard.prototype.transform = function(data) {
        return data;
      };

      ReportCard.prototype.getData = function(opts) {
        var $this;
        $this = this;
        return $.ajax({
          type: "GET",
          url: this.url,
          localCache: true,
          cacheTTL: 0.5,
          cacheKey: 'reportcard' + options.site + options.userName,
          dataType: opts.dataType,
          crossDomain: true,
          async: true,
          beforeSend: function() {
            options.$element.html('<div class="spinner"></div>');
          },
          success: function(data) {
            return $this.build($this.transform(data));
          }
        });
      };

      return ReportCard;

    })();
    Treehouse = (function(_super) {
      __extends(Treehouse, _super);

      function Treehouse(params) {
        Treehouse.__super__.constructor.call(this, params);
        this.url = "https://teamtreehouse.com/" + this.userName + ".json";
      }

      Treehouse.prototype.getData = function() {
        return Treehouse.__super__.getData.call(this, {
          dataType: 'json'
        });
      };

      Treehouse.prototype.transform = function(data) {
        return {
          site: "Treehouse",
          username: data.profile_name,
          profile_url: data.profile_url,
          points: data.points,
          points_total: data.points.total,
          badge_count: data.badges.length,
          badges: data.badges.map(function(badge) {
            return {
              courses: badge.courses,
              course_count: badge.courses.length,
              earned_date: Date.parse(badge.earned_date),
              icon_url: badge.icon_url,
              label: badge.name,
              url: badge.url
            };
          })
        };
      };

      return Treehouse;

    })(ReportCard);
    Codeschool = (function(_super) {
      __extends(Codeschool, _super);

      function Codeschool(params) {
        Codeschool.__super__.constructor.call(this, params);
        this.url = "https://www.codeschool.com/users/" + this.userName + ".json";
      }

      Codeschool.prototype.getData = function() {
        return Codeschool.__super__.getData.call(this, {
          dataType: 'jsonp'
        });
      };

      Codeschool.prototype.transform = function(data) {
        return {
          site: "Code School",
          username: data.user.username,
          profile_url: 'https://www.codeschool.com/users/' + data.user.username,
          points: void 0,
          points_total: data.user.total_score,
          badge_count: data.badges.length,
          badges: data.badges.map(function(badge) {
            return {
              courses: void 0,
              course_count: void 0,
              earned_date: void 0,
              icon_url: badge.badge,
              label: badge.name,
              url: badge.course_url
            };
          })
        };
      };

      return Codeschool;

    })(ReportCard);
    options.$element = this;
    options.badgesAmount = options.badgesAmount ? options.badgesAmount : 5;
    if (!options.userName) {
      alert('You need to pass in a username');
    }
    if (!options.site) {
      alert('You need to pass in a site');
    }
    if (options.site === "treehouse") {
      th = new Treehouse(options);
      return th.getData();
    } else if (options.site === "codeschool") {
      cs = new Codeschool(options);
      return cs.getData();
    }
  };
})(jQuery);

// ---
// generated by coffee-script 1.9.0
