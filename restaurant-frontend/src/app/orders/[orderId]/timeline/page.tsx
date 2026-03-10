'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/api/client';
import { OrderEvent, TimelineResponse } from '@/types';
import { Activity, ArrowLeft, ChevronDown, ChevronUp, Info } from 'lucide-react';
import styles from './timeline.module.css';
import Link from 'next/link';

export default function OrderTimelinePage() {
  const { orderId } = useParams() as { orderId: string };
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchEvents = async (key?: unknown) => {
    try {
      let url = `/orders/${orderId}/timeline?pageSize=50`;
      if (key) url += `&lastKey=${encodeURIComponent(JSON.stringify(key))}`;
      const { data } = await apiClient.get<TimelineResponse>(url);
      const sorted = [...data.events].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      if (key) {
        setEvents(prev => [...prev, ...sorted]);
      } else {
        setEvents(sorted);
      }
      setLastEvaluatedKey(data.lastEvaluatedKey);
      setHasMore(!!data.lastEvaluatedKey);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchEvents(lastEvaluatedKey);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [orderId]);

  const toggleRow = (id: string) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  if (isLoading) return <div className={styles.loading}>Loading Timeline...</div>;

  return (
    <div className={styles.container}>
      <main className={styles.inner}>
        <header className={styles.header}>
          <Link href={`/orders/${orderId}`} className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Order Status</span>
          </Link>

          <div className={styles.topRow}>
            <div className={styles.titleBox}>
              <Activity size={24} color="var(--primary)" />
              <h1 className={styles.title}>Event Timeline</h1>
            </div>
            <span className={styles.orderIdBadge}>
              #{orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <p className={styles.subtitle}>
            {events.length} event{events.length !== 1 ? 's' : ''} — sorted by most recent first
          </p>
        </header>

        {events.length === 0 ? (
          <div className={`glass-card ${styles.emptyState}`}>
            No events found for this order yet. Events appear here as your order progresses.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Event ID</th>
                  <th>Correlation ID</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <React.Fragment key={event.eventId}>
                    <tr className={`${styles.row} ${expandedRow === event.eventId ? styles.rowExpanded : ''} ${idx === 0 ? styles.rowLatest : ''}`}>
                      <td className={styles.cellTime}>
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles[`type_${event.type.replace(/_/g, '').toLowerCase()}`] || ''}`}>
                          {event.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={styles.sourceBadge}>{event.source.toUpperCase()}</span>
                      </td>
                      <td className={styles.cellMono}>
                        {event.eventId.slice(0, 8).toUpperCase()}
                      </td>
                      <td className={styles.cellMono}>
                        {event.correlationId.slice(0, 8).toUpperCase()}
                      </td>
                      <td>
                        <button
                          className={styles.expandBtn}
                          onClick={() => toggleRow(event.eventId)}
                          title="View payload"
                        >
                          <Info size={14} />
                          {expandedRow === event.eventId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === event.eventId && (
                      <tr className={styles.payloadRow}>
                        <td colSpan={6}>
                          <div className={styles.payloadBox}>
                            <pre className={styles.payload}>
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && (
          <button
            className={styles.loadMoreBtn}
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading next 50...' : 'Load More Events'}
          </button>
        )}
      </main>
    </div>
  );
}
