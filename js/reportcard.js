function calcHeight() {
    var $more = $('.more-badges a');
    $.each($more, function () {
        var height = $(this).parent().parent().find('li:first-child img').height();
        $(this).height(height).css('line-height', height + "px");
    });
}

(function ($) {
    $.fn.reportCard = function (options) {
        var gif = '<div class="loadinggif"><p style="text-align:center;">Loading Report Card...</p><div class="spinftw"></div></div>';
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function calcDate(date) {
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        }

        function firstImageLoad() {
            var $images = $(".badges img"),
                imageCount = $images.length,
                counter = 0;

            // one instead of on, because it need only fire once per image
            $images.one("load", function () {
                // increment counter everytime an image finishes loading
                counter++;
                if (counter === imageCount) {
                    // do stuff when all have loaded
                    calcHeight();
                }
            }).each(function () {
                if (this.complete) {
                    // manually trigger load event in
                    // event of a cache pull
                    $(this).trigger("load");
                    calcHeight();
                }
            });
        }

        function reloadTips() {
            $('.progress div, .badges img, .more-badges a').tooltip();
        }

        function calculateTreehouseDemensions(){
            $.each($('.report-card.treehouse'), function(){
                var widgetWidth = $(this).width();
                if(widgetWidth > 899){
                    $(this).find('.more-badges').css('font-size', '45px');
                    $(this).find('h1').css({"font-size": "3em","line-height": "1.2em"});
                } else if(widgetWidth > 579){
                    $(this).find('.more-badges').css('font-size', '30px');
                    $(this).find('h1').css({"font-size": "2em","line-height": "1.2em"});
                } else if(widgetWidth < 500){
                    $(this).find('.more-badges').css('font-size', '20px');
                    $(this).find('h1').css({"font-size": "20px","line-height": "25px"});
                } else if(widgetWidth < 261){
                    $(this).find('.more-badges').css({"width": "9%","font-size": "15px"});
                }

                if(widgetWidth > 300){
                    $(this).find('.more-badges').show();
                } else {
                    $(this).find('.more-badges').hide();
                }

            });
        }


        function treehouseReportCard(options) {
            var userName = options.userName;
            var reportCardUrl = "http://teamtreehouse.com/" + options.userName + ".json";

            function badgeBuilder(badges) {
                var badgesArray = [],
                    badgesCount = badges.length,
                    count = settings.badgesAmount,
                    summary = "<p>Some of the last few courses I've taken were on ";

                badgesArray += '<ul class="badges">';
                for (var e = 0; e < count && e < badgesCount; e++) {
                    var date = new Date(badges[e].earned_date);
                    var earnedDate = calcDate(date);

                    if (e < count - 1) {
                        badgesArray += '<li style="width: ' + (((90 / count) * 100) / 100).toFixed(2) + '%"><a href="' + badges[e].url + '" title="I earned the ' + badges[e].name + ' badge on ' + earnedDate + '" target="_blank"><img class="treebadge" src="' + badges[e].icon_url + '" alt="' + badges[e].name + '" title="I earned the \'' + badges[e].name + '\' badge on ' + earnedDate + '"/></a></li>';
                    } else {
                        badgesArray += '<li style="width: ' + (((90 / count) * 100) / 100).toFixed(2) + '%" class="more-badges"><a href="http://teamtreehouse.com/' + userName + '" target="_blank" title="Check out the other ' + (badgesCount - count + 1) + ' badges at Treehouse!" >+' + (badgesCount - count + 1) + '</a></li>';
                    }

                    if (e < 3) {
                        summary += '<strong>' + badges[e].name + '</strong>' + ", ";
                    } else if (e < 4) {
                        summary += " and <strong>" + badges[e].name + "</strong>!</p>";
                    }
                }
                badgesArray += "</ul>";

                return badgesArray + summary;
            }

            function generateBadges(badges) {
                // Latest Badges Builder
                var badgesArray = badgeBuilder(badges);

                // Badges this month
                /* Not currently being used, but this could be for a "badeges this month" or "Badges this year" */
                var badgesThisMonth = 0,
                    badgesThisYear = 0;
                $.each(badges, function (i) {
                    var badgeDate = Date.parse(badges[i].earned_date),
                        now = Date.parse(new Date());
                    if (badgeDate > now - 2628000000 /* <-- One Month in Milliseconds */ ) {
                        badgesThisMonth = badgesThisMonth + 1;
                    }
                    if (badgeDate > now - 3.15569e10) {
                        badgesThisMonth = badgesThisYear + 1;
                    }
                });
                // Append Badge to badges
                $('.report-card.treehouse').append(badgesArray);
            }

            $.ajax({
                type: "GET",
                url: reportCardUrl,
                datatype: "json",
                async: true,
                cache: false,
                beforeSend: function () {
                    $('.report-card.treehouse').parent().prepend(gif);
                    $('.report-card.treehouse').hide();
                },
                success: function (data) {
                    var dObj = (typeof data === "string") ? JSON.parse(data) : data;
                    $(".report-card.treehouse").append('<h1>I have passed ' + dObj.badges.length + ' lessons and scored ' + numberWithCommas(dObj.points.total) + ' points at Treehouse!</h1><p>Check out some of my last passed course content at the badges below: </p>');
                    generateBadges(dObj.badges.reverse());
                },
                error: function () {},
                complete: function () {
                    $('.report-card.treehouse').prev().remove();
                    $('.report-card.treehouse').fadeIn(1000);
                    reloadTips();
                    firstImageLoad();
                    calculateTreehouseDemensions();
                }
            });
        }

        /* ### CodeSchool Code ### */

        function codeschoolReportCard(options) {
            var username = options.userName,
                codeschoolJsonUrl = 'https://www.codeschool.com/users/' + username + '.json',
                totalScore = 0;

            var javaScript = 0,
                git = 0,
                ruby = 0,
                html = 0,
                css = 0,
                dev = 0,
                total = 0,
                obj = {};

            function badgeGenerator(badges) {
                var completed = "";
                var dividePercentage = ( badges.length > 2 ? 93 : 10);
                var width = (dividePercentage / badges.length).toFixed(2);
                completed += '<ul class="badges codeschool">';
                $.each(badges, function (i) {
                    var title = badges[i].title;
                    completed += '<li style="width:' + width + '%;">';
                    completed += '<a href="' + badges[i].url + '" title="' + title + '" target="_blank">';
                    completed += '<img src="' + badges[i].badge + '" title="' + title + '" alt="' + title + '" />';
                    completed += '</a>';
                    completed += '</li>';
                });
                completed += '</ul>';
                return completed;
            }

            function codeschoolBadgeCount(type) {

                $.each(type, function (i) {

                    var title = type[i].title;

                    switch (title) {

                    case "Discover DevTools":
                        dev = dev + 1;
                        total = total + 1;
                        break;

                    case "jQuery Air: Captain's Log":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Anatomy of Backbone.js":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Git Real":
                        git = git + 1;
                        total = total + 1;
                        break;

                    case "Try jQuery":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Assembling Sass":
                        css = css + 1;
                        total = total + 1;
                        break;

                    case "Real-time Web with Node.js":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Rails Testing for Zombies":
                        ruby = ruby + 1;
                        total = total + 1;
                        break;

                    case "CSS Cross-Country":
                        css = css + 1;
                        total = total + 1;
                        break;

                    case "CoffeeScript":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Rails for Zombies 2":
                        ruby = ruby + 1;
                        total = total + 1;
                        break;

                    case "Functional HTML5 & CSS3":
                        css = css + 1;
                        html = html + 1;
                        total = total + 1;
                        break;

                    case "jQuery Air: First Flight":
                        javaScript = javaScript + 1;
                        total = total + 1;
                        break;

                    case "Try Git":
                        git = git + 1;
                        total = total + 1;
                        break;

                    case "Rails for Zombies Redux":
                        ruby = ruby + 1;
                        total = total + 1;
                        break;

                    case "Try Ruby":
                        ruby = ruby + 1;
                        total = total + 1;
                        break;
                    }
                });
            }


            function generateCodeSchoolBadges(data) {
                var compleatedCourses = data.courses.completed,
                    enrolledCourses = data.courses.in_progress;

                var complete = badgeGenerator(compleatedCourses);
                var enrolled = badgeGenerator(enrolledCourses);

                codeschoolBadgeCount(compleatedCourses);
                codeschoolBadgeCount(enrolledCourses);
                obj.javascript = javaScript;
                obj.ruby = ruby;
                obj.html = html;
                obj.css = css;
                obj.dev = dev;
                obj.git = git;
                obj.total = total;

                // Fix STUPID Codeschool 'Total Score' format
                var totalScore = data.user.total_score;
                $('.report-card.codeschool').append('<h5>I\'ve completed ' + compleatedCourses.length + ' courses, earned ' + data.badges.length + ' badges, and scored ' + numberWithCommas(totalScore) + ' points at CodeSchool!</h5>');
                $('.report-card.codeschool').append(complete);
                $('.report-card.codeschool').append('<hr><p>I am also currently enrolled in ' + enrolledCourses.length + ' additional courses, including: <p>');
                $('.report-card.codeschool').append(enrolled);
                $('.report-card.codeschool img, .report-card.codeschool img').tooltip();
            }


            $.ajax({
                type: "GET",
                url: codeschoolJsonUrl,
                dataType: "jsonp",
                cache: false,
                // Before ajax is called
                beforeSend: function () {
                    $('.report-card.codeschool').parent().prepend(gif);
                    $('.report-card.codeschool').hide();
                },
                // If ajax succeeds
                success: function (data) {
                    generateCodeSchoolBadges(data);
                    $('.CodeSchool-chart div').tooltip();
                },
                // If ajax fails
                error: function () {
                    console.log('error...');
                },
                // When succeed or fail procees completes
                complete: function () {
                    $('.report-card.codeschool').prev().remove();
                    $('.report-card.codeschool').fadeIn(1000);
                }
            });
        }
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            userName: "rileyhilliard",
            site: "treehouse",
            badgesAmount: 6
        }, options);

        if (settings.site === "treehouse") {
            treehouseReportCard(settings);
        } else if (settings.site === "codeschool") {
            codeschoolReportCard(settings);
        }

        // re-calc more badge height
    $(window).resize(function () {
        calcHeight();
        calculateTreehouseDemensions();
    });

    };

}(jQuery));

// re-calc more badge height
$(window).resize(function () {
    calcHeight();
});