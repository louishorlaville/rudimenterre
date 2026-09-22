import {useEffect, useMemo, useRef, useState} from 'react';
import {HOME_REVIEWS} from '~/lib/home-reviews';

type HomeReviewsProps = {
  locale: string;
};

function getCardScrollLeft(track: HTMLElement, card: HTMLElement) {
  return (
    track.scrollLeft +
    card.getBoundingClientRect().left -
    track.getBoundingClientRect().left
  );
}

function getNearestPage(track: HTMLElement, pageStarts: number[]) {
  const cards = Array.from(
    track.querySelectorAll<HTMLElement>('.home-reviews__card'),
  );

  return pageStarts.reduce((nearest, cardIndex, page) => {
    const nearestCard = cards[pageStarts[nearest]];
    const card = cards[cardIndex];

    return card &&
      nearestCard &&
      Math.abs(getCardScrollLeft(track, card) - track.scrollLeft) <
        Math.abs(getCardScrollLeft(track, nearestCard) - track.scrollLeft)
      ? page
      : nearest;
  }, 0);
}

export function HomeReviews({locale}: HomeReviewsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const [reviewsPerPage, setReviewsPerPage] = useState(3);
  const [activePage, setActivePage] = useState(0);
  const fr = locale === 'fr';
  const isCarousel = HOME_REVIEWS.length > 3;

  const pageStarts = useMemo(() => {
    const pageCount = Math.ceil(HOME_REVIEWS.length / reviewsPerPage);

    return Array.from({length: pageCount}, (_, page) =>
      Math.min(page * reviewsPerPage, HOME_REVIEWS.length - reviewsPerPage),
    );
  }, [reviewsPerPage]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const updateReviewsPerPage = () =>
      setReviewsPerPage(mobileQuery.matches ? 1 : 3);

    updateReviewsPerPage();
    mobileQuery.addEventListener('change', updateReviewsPerPage);

    return () =>
      mobileQuery.removeEventListener('change', updateReviewsPerPage);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    setActivePage(getNearestPage(track, pageStarts));
  }, [pageStarts]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current)
        window.cancelAnimationFrame(scrollFrameRef.current);
    },
    [],
  );

  const updateActivePage = () => {
    if (scrollFrameRef.current)
      window.cancelAnimationFrame(scrollFrameRef.current);

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;

      setActivePage(getNearestPage(track, pageStarts));
    });
  };

  const scrollToPage = (page: number) => {
    const track = trackRef.current;
    const card = track?.querySelectorAll<HTMLElement>('.home-reviews__card')[
      pageStarts[page]
    ];
    if (!track || !card) return;

    setActivePage(page);
    track.scrollTo({
      left: getCardScrollLeft(track, card),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
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
        </header>

        <div
          className="home-reviews__track"
          ref={trackRef}
          role={isCarousel ? 'region' : undefined}
          aria-label={
            isCarousel
              ? fr
                ? 'Carrousel des avis clients'
                : 'Customer review carousel'
              : undefined
          }
          onScroll={isCarousel ? updateActivePage : undefined}
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

        {isCarousel ? (
          <div
            className="home-reviews__pagination"
            aria-label={fr ? 'Pages des avis clients' : 'Customer review pages'}
          >
            {pageStarts.map((_, page) => (
              <button
                type="button"
                key={page}
                onClick={() => scrollToPage(page)}
                aria-label={
                  fr
                    ? `Afficher la page ${page + 1} sur ${pageStarts.length}`
                    : `Show page ${page + 1} of ${pageStarts.length}`
                }
                aria-current={activePage === page ? 'page' : undefined}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
