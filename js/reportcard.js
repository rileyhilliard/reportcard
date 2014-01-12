(function ( $ ) {
 
    $.fn.reportCard = function( options ) {

        
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        function calcDate(date){
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        }

        function firstImageLoad(){
            var $images = $(".badges img"), 
                imageCount = $images.length, 
                counter = 0;

            // one instead of on, because it need only fire once per image
            $images.one("load",function(){
                 // increment counter everytime an image finishes loading
                 counter++;
                 if (counter == imageCount) {
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
        function reverseSortObject(obj) {
            var arr = [];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    arr.push({
                        'key': prop,
                        'value': obj[prop]
                    });
                }
            }
            arr.sort(function (a, b) {
                return b.value - a.value;
            });
            return arr;
        }


        function treehouseReportCard(options){
            var userName = options.userName;
            var reportCardUrl = "http://teamtreehouse.com/"+options.userName+".json";

            function generateTreehousePoints(points) {
                var pointsContainer = [];
                var value = 0;

                /* If the JSON points total is ever needed... */
                // var pointsCountTotal = points.total;

                $.each(points, function (key, val) {
                    if (val.key !== 'total') {
                        value = value + val.value;
                    }
                });

                //Loop to add each point total.
                pointsContainer += '<div id="mainPoints" class="badgesChart treehouseBadgesChart"><li><div class="progress">';
                $.each(points, function (i, val2) {
                    if (val2.key !== 'total') {
                        var percent = ((val2.value / value) * 100);
                        percent = percent.toFixed(2);

                        if (percent < 12) {
                            pointsContainer += '<div data-toggle="tooltip" title="I\'ve scored ' + numberWithCommas(val2.value) + ' points in ' + val2.key + ' at TreeHouse!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"></div>';
                        } else {
                            pointsContainer += '<div data-toggle="tooltip" title="I\'ve scored ' + numberWithCommas(val2.value) + ' points in ' + val2.key + ' at TreeHouse!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"><span>' + val2.key + '</span></div>';
                        }
                    }
                });
                pointsContainer += '</div></li></div>';
                $('.report-card.treehouse').append(pointsContainer);
            }

            function badgeBuilder(badges) {
                var badgesArray = [],
                    badgesCount = badges.length,
                    count = settings.badgesAmount,
                    summary = "<p>Some of the last few courses I've taken were on ";

                badgesArray += '<ul class="badges">';
                for (var e = 0; e < count; e++) {
                    var date = new Date(badges[e].earned_date);
                    var earnedDate = calcDate(date);

                    if (e < count - 1) {
                        badgesArray += '<li style="width: ' + (((90 / count) * 100) / 100).toFixed(2) + '%"><a href="' + badges[e].url + '" title="I earned the ' + badges[e].name + ' badge on ' + earnedDate + '" target="_blank"><img class="treebadge" src="' + badges[e].icon_url + '" alt="' + badges[e].name + '" title="I earned the \'' + badges[e].name + '\' badge on ' + earnedDate + '"/></a></li>';
                    } else {
                        badgesArray += '<li style="width: ' + (((90 / count) * 100) / 100).toFixed(2) + '%" class="more-badges"><a href="http://teamtreehouse.com/'+userName+'" target="_blank" title="Check out the other ' + (badgesCount - count + 1) + ' badges at Treehouse!" >+' + (badgesCount - count + 1) + '</a></li>';
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
                        badgesThreeMonth = badgesThisYear + 1;
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
                    var gif = '<div class="loadinggif"><p style="text-align:center;">Loading Report Card...</p><div style="margin:0 auto; width:200px;"><img src="img/ajax-loader.gif" /><div></div>';
                    $('.report-card.treehouse').parent().prepend(gif);
                    $('.report-card.treehouse').hide();
                },
                success: function (data) {
                    var dObj = (typeof data === "string") ?  JSON.parse(data) : data;
                    var latest = reverseSortObject(dObj.points);
                    $(".report-card.treehouse").append('<h1>I have passed ' + dObj.badges.length + ' lessons and scored ' + numberWithCommas(dObj.points.total) + ' points at Treehouse!</h1><p>Check out some of my last passed course content at the badges below: </p>');
                    generateBadges(dObj.badges.reverse());
                    generateTreehousePoints(latest);
                },
                error: function(){},
                complete: function(){
                    $('.report-card.treehouse').prev().remove();
                    $('.report-card.treehouse').fadeIn(1000);
                    reloadTips();
                    firstImageLoad();
                    // $('.report-card.treehouse').css('text-align', 'center');
                }
            });
        }

        function codeschoolReportCard(options){

            var username = options.userName,
                codeschoolJsonUrl = 'https://www.codeschool.com/users/'+username+'.json',
                container = $('#codeSchool-count'),
                enrolledContainer = $('#codeSchool-enrolledbBadges'),
                progressBar = [],
                treehouseJsonData = "",
                pointsTotal = [],
                totalScore = 0;

            var javaScript = 0,
                git = 0,
                ruby = 0,
                html = 0,
                css = 0,
                dev = 0,
                total = 0, 
                obj = {};

            function badgeGenerator(badges){
                var completed = [];
                var width = (93/badges.length).toFixed(2);
                completed += '<ul class="badges codeschool">';
                $.each(badges, function(i,l){
                    var title = badges[i].title;
                    completed += '<li style="width:'+width+'%;">';
                        completed += '<a href="'+badges[i].url+'" title="'+title+'" target="_blank">';
                            completed += '<img src="'+badges[i].badge+'" title="'+title+'" alt="'+title+'" />';
                        completed += '</a>'    
                    completed += '</li>';
                });
                completed += '</ul>';
                return completed;
            }
            function codeschoolBadgeCount(type){

                $.each(type, function(i,l){

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
            function codeschoolStatBar(obj){

                var sorted = reverseSortObject(obj);
                var value = 0;
                var pointsCountTotal = 0;

                $.each(sorted, function (key, val) {
                    if (val.key === 'total') {
                        pointsCountTotal = val.value
                    } else {
                        value =  value + val.value;
                    }
                });

                //Loop to add each point total.
                progressBar += '<li>';
                progressBar += '<div class="progress">';
                $.each(sorted, function (i, val2) {
                    if (val2.key === 'total') {
                        // Do Nothing
                    } else {
                        console.log(val2.value);
                        var percent = ((val2.value / value) * 100);
                        var itemPonts = Math.floor(totalScore*(percent*.01));
                        itemPonts = numberWithCommas(itemPonts);

                        if (percent < 12) {
                            progressBar += '<div data-toggle="tooltip" title="I\'ve scored '+itemPonts+' points in '+val2.key+' at CodeSchool!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"></div>';
                        } else {
                            progressBar += '<div data-toggle="tooltip" title="I\'ve scored '+itemPonts+' points in '+val2.key+' at CodeSchool!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"><span>' + val2.key + '</span></div>';
                        }
                    }
                });
                progressBar += '</div>';
                progressBar += '</li>';
                return '<div id="codeSchool-points" class="badgesChart CodeSchool-chart">'+progressBar+'</div>';
                // $('.CodeSchool-chart').html(progressBar);
            }

            function generateCodeSchoolBadges(data){
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
                var x = data.user.total_score;
                totalScore = x.replace("<b>","").replace("</b>","").replace("Total Points","");
                
                var codeSchoolStats = codeschoolStatBar(obj);

                $('.report-card.codeschool').append('<h5>I\'ve completed ' + compleatedCourses.length + ' courses, earned '+data.badges.length+' badges, and scored '+numberWithCommas(totalScore)+' points at CodeSchool!</h5>'); 
                $('.report-card.codeschool').append(complete);
                $('.report-card.codeschool').append('<hr><p>I am also currently enrolled in '+enrolledCourses.length+' additional courses, including: <p>');
                $('.report-card.codeschool').append(enrolled);
                $('.report-card.codeschool').append(codeSchoolStats);
                $('.report-card.codeschool img, .report-card.codeschool img').tooltip();
            }


            $.ajax({
                type: "GET",
                url: codeschoolJsonUrl,
                dataType: "jsonp",
                cache: false,
                // Before ajax is called
                beforeSend: function(){
                    var gif = '<div class="loadinggif"><p style="text-align:center;">Loading Report Card...</p><div style="margin:0 auto; width:200px;"><img src="img/ajax-loader.gif" /><div></div>';
                    $('.report-card.codeschool').parent().prepend(gif);
                    $('.report-card.codeschool').hide();
                },
                // If ajax succeeds
                success: function(data){
                    generateCodeSchoolBadges(data);
                    $('.CodeSchool-chart div').tooltip();
                },
                // If ajax fails
                error: function(){
                    console.log('error...');
                },
                // When succeed or fail procees completes 
                complete: function(){
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
        }, options );

        if(settings.site === "treehouse"){
            treehouseReportCard(settings);
        } else if (settings.site === "codeschool"){
            codeschoolReportCard(settings);
        }

    };
 
}( jQuery ));

function calcHeight(){
    var $more = $('.more-badges a');
    $.each($more, function(){
        var height = $(this).parent().parent().find('li:first-child img').height();
        $(this).height(height).css('line-height',height+"px");
    }); 
}
// re-calc more badge height
$(window).resize(function() {
    calcHeight();
});
