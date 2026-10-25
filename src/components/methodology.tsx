export default function Methodology() {
  return (
    <section className="methodology" id="methodology" aria-labelledby="methodology-heading">
      <div>
        <span className="eyebrow">Read the numbers</span>
        <h2 id="methodology-heading">
          Two signals.
          <br />
          Different questions.
        </h2>
        <p>Keep the public’s vote intentions and the market’s expectations in context.</p>
      </div>
      <div className="methodology-details">
        <details open>
          <summary>
            What do the polls measure?<span>+</span>
          </summary>
          <p>
            Individual surveys report vote share, including undecided and other voters. We show the
            latest valid general-election poll for the listed matchup, not a weighted average.
            Samples, dates and sponsors vary. A lead is not a win probability.
          </p>
          <p>
            VoteHub supplies the House generic ballot under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
              CC BY 4.0
            </a>
            . State surveys come from{' '}
            <a href="https://www.pollingforecast.com/us/data" target="_blank" rel="noreferrer">
              Polling Forecast’s free API
            </a>
            ; its Wikipedia-sourced rows and our normalized rows are{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0
            </a>
            . Original poll links and each row’s licence appear on the cards. LV = likely voters; RV
            = registered voters; A = adults. Polls older than 14 days are flagged.
          </p>
        </details>
        <details>
          <summary>
            What do the markets measure?<span>+</span>
          </summary>
          <p>
            Prices are market-implied probabilities for each platform’s resolution rules. Polymarket
            uses the API’s Yes outcome price. Kalshi uses the midpoint of its current Yes bid and
            ask. We quote both parties independently; their values may not sum to 100%. Fees,
            spreads and liquidity matter.
          </p>
          <p>
            We observe quotes when a request completes. Polymarket also provides an outcome update
            timestamp. Kalshi’s metadata update is not a trade timestamp. Closed markets, empty
            books and unavailable sources show no quote. No market price is a polling average.
          </p>
        </details>
        <details>
          <summary>
            How is the watchlist selected?<span>+</span>
          </summary>
          <p>
            Six curated races keep this Modern.js demo small: three Senate races (TX, ME, MI) and
            three governor races (GA, WI, NV). This is an editorial learning scope, not an
            exhaustive competitiveness ranking. Highlighted states indicate coverage; the map does
            not predict winners.
          </p>
          <p>
            Data is fetched on page load and when you select Refresh data. There is no background
            polling. Failures are isolated by source, and we never substitute simulated numbers.
            These are pre-election polls and markets, not election returns.
          </p>
        </details>
        <details>
          <summary>
            Free APIs & source documentation<span>+</span>
          </summary>
          <p>
            <a href="https://votehub.com/polls/api/" target="_blank" rel="noreferrer">
              VoteHub polling API ↗
            </a>
            <br />
            <a href="https://www.pollingforecast.com/us/data" target="_blank" rel="noreferrer">
              Polling Forecast data API ↗
            </a>
            <br />
            <a
              href="https://docs.polymarket.com/market-data/discover-markets"
              target="_blank"
              rel="noreferrer"
            >
              Polymarket market data ↗
            </a>
            <br />
            <a
              href="https://docs.kalshi.com/getting_started/quick_start_market_data"
              target="_blank"
              rel="noreferrer"
            >
              Kalshi public market data ↗
            </a>
          </p>
          <p>
            Map geometry:{' '}
            <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noreferrer">
              us-atlas
            </a>
            , derived from US Census boundaries. Alaska and Hawaii are inset.
          </p>
        </details>
      </div>
    </section>
  );
}
