function CallData() {
  let timestamp = + new Date();

  let previousTime = new Date(timestamp - 180000000);

  let date = new Date();
  let startDate = previousTime.toISOString();
  let endDate = date.toISOString();

  let address = `https\:\/\/api.bitcointrade.com.br\/v1\/public\/BTC\/trades\?start_time=${startDate}\&end_time=${endDate}\&page_size=100\&current_page=1`;

  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = (result) => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    if (xhr.status !== 200) {
      return;
    }

    processData(JSON.parse(xhr.responseText));
  }

  xhr.open('GET', address, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
}

const removeString = (item) => typeof item !== 'string';
const sum = (acc, value) => acc + value;

function processData(result) {
  let { data } = result;

  let { trades } = data;

  let majorPosition = 0;
  let sequences = [];
  let sequence = [];

  let iterableTime = + new Date();
  let totalTradesValues = trades.map((obj) => obj.unit_price).reduce(sum);

  trades.forEach((trade) => {
    let { date, unit_price } = trade;
    let timestampTransaction = + new Date(date);

    if (!sequence.length) {
      time = new Date(iterableTime - 300000);

      let adjustedMinutes = time.getMinutes().length < 2 ? '0' + time.getMinutes() : time.getMinutes();

      sequence.push(`${time.getHours()}\:${adjustedMinutes}`);
      // sequence.push(totalTradesValues / trades.length);
    }

    if (timestampTransaction > (iterableTime - 300000)) {
      sequence.push(unit_price);
    } else {
      iterableTime = (iterableTime - 300000);

      if (sequence.length > 2) {

        if (majorPosition < sequence.length) {
          majorPosition = sequence.length;
        }

        sequences.push(sequence);
      }

      sequence = [];
    }

  });

  let newSequence = sequences.map((_sequence) => {

    let min, max, fourSequence = [], sequenceTime = _sequence[0];

    _sequence.filter(removeString).forEach((item, index) => {
      if (!index) {
        max = item;
        min = item;
      }

      if (item < min) {
        min = item;
      }

      if (item > max) {
        max = item;
      }
    });

    let total = _sequence.filter(removeString).reduce(sum);

    fourSequence.push(sequenceTime);

    fourSequence.push(min);
    fourSequence.push(total/(_sequence.length - 1));
    fourSequence.push(max);
    fourSequence.push(max);

    return fourSequence;

  });

  let reversed = newSequence.reverse();

  console.log(reversed);

  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(function drawChart() {

    var data = google.visualization.arrayToDataTable(reversed, true);

    var options = {
      legend: 'none',
      candlestick: {
        fallingColor: {strokeWidth: 0, fill: '#a52714' }, // red
        risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
      },
      seriesType: 'candlesticks'
    };


    var chart = new google.visualization.CandlestickChart(document.getElementById('chart_div'));
    chart.draw(data, options);

  });


}
