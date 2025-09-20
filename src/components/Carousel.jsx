import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

export default function PosterCarousel() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/events?sort=recent');
        if (mounted) {
          setEvents(res.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <>
      <div
        className='container2'
        style={{
          backgroundColor: "#7895CB",
          height: '55vh',
          width: '100%',
          marginTop: '0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className='container'
          style={{
            height: '50vh',
            width: '95%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Swiper
            slidesPerView={3}
            spaceBetween={24}
            centeredSlides={true}
            initialSlide={2}
            loop={true}
            autoplay={{
              delay: 70000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            modules={[Pagination, Navigation, Autoplay]}
            className="mySwiper"
            style={{
              '--swiper-pagination-color': '#4A90A4',
              '--swiper-pagination-bullet-inactive-color': 'rgba(74, 144, 164, 0.4)',
              width: '100%',
              height: '100%'
            }}
          >
            {events.map((event) => (
              <SwiperSlide key={event._id}>
                <div
                  style={{
                    width: '100%',
                    height: '48vh',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                    opacity: '0.7',
                    transform: 'scale(0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa' // 👈 added fallback bg for padded images
                  }}
                  className="slide-content"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  <img
                    src={event.posterUrl.replace(
                      '/upload/',
                      '/upload/w_600,h_800,c_pad,b_white/' // 👈 Cloudinary transformation
                    )}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // 👈 show full image inside padded box
                      borderRadius: '8px',
                      display: 'block'
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev-custom">
            <ChevronLeft size={20} />
          </div>
          <div className="swiper-button-next-custom">
            <ChevronRight size={20} />
          </div>
        </div>

        <style>{`
          .container2 {
            padding: 15px;
          }
          
          .container {
            position: relative;
          }
          
          .mySwiper .swiper-slide-active .slide-content {
            opacity: 1 !important;
            transform: scale(1) !important;
          }
          
          .mySwiper .swiper-pagination {
            bottom: -25px;
            position: relative;
            text-align: center;
          }
          
          .mySwiper .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            margin: 0 6px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          .mySwiper .swiper-pagination-bullet-active {
            background: #fff;
            transform: scale(1.2);
          }
          
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #7895CB;
            z-index: 10;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .swiper-button-prev-custom:hover,
          .swiper-button-next-custom:hover {
            background: rgba(255, 255, 255, 1);
            border-color: rgba(255, 255, 255, 0.8);
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          
          .swiper-button-prev-custom {
            left: 15px;
          }
          
          .swiper-button-next-custom {
            right: 15px;
          }
          
          .swiper-button-prev-custom:active,
          .swiper-button-next-custom:active {
            transform: translateY(-50%) scale(0.95);
          }
        `}</style>
      </div>
    </>
  );
}
