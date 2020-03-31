// https://observablehq.com/@mognar/bar-chart-race@591
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md `# Bar chart race`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style>

text{
  font-size: 16px;
  font-family: Open Sans, sans-serif;
}
text.title{
  font-size: 24px;
  font-weight: 500;
}
text.subTitle{
  font-weight: 500;
  fill: #777777;
}
text.caption{
  font-weight: 400;
  font-size: 14px;
  fill: #777777;
}
text.label{
  font-weight: 400;
  font-size: 12px;
}

text.valueLabel{
  font-weight: 400;
  font-size: 10px;
}
text.yearText{
  font-size: 64px;
  font-weight: 700;
  opacity: 0.25;
}
.tick text {
  fill: #777777;
}
.xAxis .tick:nth-child(2) text {
  text-anchor: start;
}
.tick line {
  shape-rendering: CrispEdges;
  stroke: #dddddd;
}
.tick line.origin{
  stroke: #aaaaaa;
  opacity: 0.5;
}
path.domain{
  display: none;
}
</style>`
)});
  main.variable(observer("tickDuration")).define("tickDuration", function(){return(
3000
)});
  main.variable(observer("top_n")).define("top_n", function(){return(
20
)});
  main.variable(observer("chart")).define("chart", ["d3","DOM","width","height","top_n","brandData","tickDuration"], function(d3,DOM,width,height,top_n,brandData,tickDuration)
{
  const svg = d3.select(DOM.svg(width, height));
  
  const margin = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 200
  };
  
  let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);
  
  let title = svg.append('text')
    .attrs({
      class: 'title',
      y: 24
    })
    .html('Top 20 terms used to index Parliamentary material');
  
  let subTitle = svg.append('text')
    .attrs({
      class: 'subTitle',
      y: 55
    })
    .html('December 2019 - March 2020');
  
  let caption = svg.append('text')
    .attrs({
      class: 'caption',
      x: width,
      y: height-5
    })
    .styles({
      'text-anchor': 'end'
    })
    .html('Source: Search Parliamentary Material');
  
  

  let year = 2019
  
  brandData.forEach(d => {
    d.value = +d.value,
    d.lastValue = +d.lastValue,
    d.value = isNaN(d.value) ? 0 : d.value,
    d.year = +d.year,
    d.color = "#046a38"
  });
  
  let yearSlice = brandData.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0,top_n);
  
  yearSlice.forEach((d,i) => d.rank = i);
  
  let x = d3.scaleLinear()
    .domain([0, d3.max(yearSlice, d => d.value)])
    .range([margin.left, width-margin.right-45]);
  
  let y = d3.scaleLinear()
    .domain([top_n, 0])
    .range([height-margin.bottom, margin.top]);
  
  let groups = brandData.map(d => d.group);
  groups = [...new Set(groups)];
  
  let colourScale = d3.scaleOrdinal()
    .range(["#046a38", "#7a4183"])
    .domain(["Normal", "EU"]);
    // .domain(groups);
  
  let xAxis = d3.axisTop()
    .scale(x)
    .ticks(width > 500 ? 5:2)
    .tickSize(-(height-margin.top-margin.bottom))
    .tickFormat(d => d3.format(',')(d));
  
  svg.append('g')
    .attrs({
      class: 'axis xAxis',
      transform: `translate(0, ${margin.top})`
    })
    .call(xAxis)
      .selectAll('.tick line')
      .classed('origin', d => d == 0);
  
  svg.selectAll('rect.bar')
    .data(yearSlice, d => d.name)
    .enter()
    .append('rect')
    .attrs({
      class: 'bar',
      x: x(0)+1,
      width: d => x(d.value)-x(0)-1,
      y: d => y(d.rank)+5,
      height: y(1)-y(0)-barPadding
    })
    .styles({
      fill: d => colourScale(d.group)
      // fill: d => d.colour
    });
  
  svg.selectAll('text.label')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attrs({
      class: 'label',
      x: x(0)-5,
      y: d => y(d.rank)+5+((y(1)-y(0))/2)+1,
      'text-anchor': 'end'
    })
    .html(d => d.name);
  
  svg.selectAll('text.valueLabel')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attrs({
      class: 'valueLabel',
      x: d => x(d.value)+5,
      y: d => y(d.rank)+5+((y(1)-y(0))/2)+1,
    })
  //change d3 format of numbers from ',.0f' to ''
    .text(d => d3.format('')(d.lastValue));
  
  let yearText = svg.append('text')
    .attrs({
      class: 'yearText',
      x: width-margin.right,
      y: height-45
      
    })
    .styles({
      'text-anchor': 'end'
    })
    .html(year)
    //.call(halo, 10);
  
  
    //.call(halo,10);
                
  
  
  let ticker = d3.interval(e => {
  
    yearSlice = brandData.filter(d => d.year == year && !isNaN(d.value))
      .sort((a,b) => b.value - a.value)
      .slice(0,top_n);
    
    yearSlice.forEach((d,i) => d.rank = i);
    
    x.domain([0, d3.max(yearSlice, d => d.value)]);
    
    svg.select('.xAxis')
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .call(xAxis);
    
    let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);
    
    bars
      .enter()
      .append('rect')
      .attrs({
        class: d => `bar ${d.name.replace(/\s/g,'_')}`,
        x: x(0)+1,
        width: d => x(d.value)-x(0)-1,
        y: d => y(top_n+1)+5,
        height: y(1)-y(0)-barPadding
      })
      .styles({
        fill: d => colourScale(d.group)
      // fill: d => d.colour
      })
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          y: d => y(d.rank)+5
        });
    
    bars
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          width: d => x(d.value)-x(0)-1,
          y: d => y(d.rank)+5
        });
    
    bars
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          width: d => x(d.value)-x(0)-1,
          y: d => y(top_n+1)+5
        })
        .remove();
    
    let labels = svg.selectAll('.label').data(yearSlice, d => d.name);
    
    labels
      .enter()
      .append('text')
      .attrs({
        class: 'label',
      //changing x from x: d => x(d.value)-8, to  x: x(0)-5,
         x: x(0)-5,
        y: d => y(top_n+1)+5+((y(1)-y(0))/2),
        'text-anchor': 'end'
      })
      .html(d => d.name)    
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          y: d => y(d.rank)+5+((y(1)-y(0))/2)+1,
        });
    
    labels
      .transition()
      .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          x: x(0)-5,
          y: d => y(d.rank)+5+((y(1)-y(0))/2)+1
        });
    
    labels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          x: x(0)-5,
          y: d => y(top_n+1)+5
        })
        .remove();
    
    let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);
    
    valueLabels
      .enter()
      .append('text')
      .attrs({
        class: 'valueLabel',
        x: d => x(d.value)+5,
        y: d => y(top_n+1)+5,
      })
    //change d3 format of numbers from ',.0f' to ''
      .text(d => d3.format('')(d.lastValue))
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          y: d => y(d.rank)+5+((y(1)-y(0))/2)+1
        });
    
    valueLabels
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          x: d => x(d.value)+5,
          y: d => y(d.rank)+5+((y(1)-y(0))/2)+1
        })
        .tween("text", function(d) {
          let i = d3.interpolateRound(d.lastValue, d.value);
          return function(t) {
            //removed , from d3.format
            this.textContent = d3.format('')(i(t));
          };
        });
    
    valueLabels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attrs({
          x: d => x(d.value)+5,
          y: d => y(top_n+1)+5
        })
        .remove();
    
    //changing yeartext based on yearyearText.html();
    if(year == 2018) yearText.html("Dec 19 - Jan 20")
    if(year == 2019) yearText.html("Dec 19 - Jan 20")
    if(year == 2020) yearText.html("Feb 20 - Mar 20")
    if(year == 2021) yearText.html("Feb 20 - Mar 20")
    
    if(year == 2021) ticker.stop();
    year = year + 1;
  },tickDuration);

  return svg.node();
}
);
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer("brandData")).define("brandData", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Mognar/barchartrace/master/topterms1920.csv')
)});
  main.variable(observer("halo")).define("halo", function(){return(
function(text, strokeWidth) {
  text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
    .styles({
      fill: '#ffffff',
      stroke: '#ffffff',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      opacity: 1
    });
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3-scale','d3-array','d3-fetch','d3-selection','d3-timer','d3-color','d3-format','d3-ease','d3-interpolate','d3-axis','d3-selection-multi')
)});
  return main;
}
