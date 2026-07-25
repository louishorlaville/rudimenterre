import {useRef} from 'react';
import {HOME_REVIEWS} from '~/lib/home-reviews';

type HomeReviewsProps = {
  locale: string;
};

export function HomeReviews({locale}: HomeReviewsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fr = locale === 'fr';
  const isCarousel = HOME_REVIEWS.length > 3;

  const scrollReviews = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>('.home-reviews__card');
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const distance = (card?.getBoundingClientRect().width ?? track.clientWidth) + gap;

    track.scrollBy({left: direction * distance, behavior: 'smooth'});
  };

  return (
    <section
      className={`home-reviews${isCarousel ? ' home-reviews--carousel' : ''}`}
      aria-labelledby="home-reviews-title"
    >
      <img
        className="home-reviews__background"
        src="/images/rudimenterre/home-reviews-kitchen.jpg"
        alt=""
        loading="lazy"
      />
      <div className="home-reviews__inner">
        <header className="home-reviews__header">
          <h2 id="home-reviews-title">
            {fr ? 'Le Cuicui expérimenté' : 'Cuicui, tried and tested'}
          </h2>
          {isCarousel ? (
            <div className="home-reviews__controls">
              <button
                type="button"
                onClick={() => scrollReviews(-1)}
                aria-label={fr ? 'Voir les avis précédents' : 'View previous reviews'}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => scrollReviews(1)}
                aria-label={fr ? 'Voir les avis suivants' : 'View next reviews'}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </header>

        <div
          className="home-reviews__track"
          ref={trackRef}
          role={isCarousel ? 'region' : undefined}
          aria-label={isCarousel ? (fr ? 'Carrousel des avis clients' : 'Customer review carousel') : undefined}
        >
          {HOME_REVIEWS.map((review, index) => (
            <article className="home-reviews__card" key={review.id}>
              <blockquote>
                <p>« {review.quote[fr ? 'fr' : 'en']} »</p>
                <footer>{review.author}</footer>
              </blockquote>
              {isCarousel ? (
                <span className="sr-only">
                  {fr
                    ? `Avis ${index + 1} sur ${HOME_REVIEWS.length}`
                    : `Review ${index + 1} of ${HOME_REVIEWS.length}`}
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
