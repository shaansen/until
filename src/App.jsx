import { useEffect, useMemo, useState } from 'react';
import { Container, Title, Text, Card, Stack, Button, Badge, Group, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import {
  loadAll, saveAll, uid, ensureSeeded, targetDate, summarize, formatWhenShort,
} from './storage.js';
import CountdownForm from './CountdownForm.jsx';
import CountdownDetail from './CountdownDetail.jsx';

export default function App() {
  const [items, setItems] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [view, setView] = useState({ mode: 'list' });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    ensureSeeded();
    setItems(loadAll());
  }, []);

  // Live "time remaining" on the list.
  useEffect(() => {
    if (view.mode !== 'list') return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [view.mode]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => targetDate(a) - targetDate(b)),
    [items],
  );

  const editing = editingId ? items.find((e) => e.id === editingId) : null;
  const detailEvent = view.mode === 'detail' ? items.find((e) => e.id === view.id) : null;

  function openNew() { setEditingId(null); setFormOpen(true); }
  function openEdit(id) { setEditingId(id); setFormOpen(true); }

  function handleSubmit(data) {
    let next;
    if (editingId) {
      next = items.map((e) => (e.id === editingId ? { ...e, ...data } : e));
    } else {
      next = [...items, { id: uid(), ...data }];
    }
    saveAll(next);
    setItems(next);
    setFormOpen(false);
    setEditingId(null);
    setView({ mode: 'list' });
  }

  function handleDelete(id) {
    if (!confirm('Delete this countdown?')) return;
    const next = items.filter((e) => e.id !== id);
    saveAll(next);
    setItems(next);
    setFormOpen(false);
    setEditingId(null);
    setView({ mode: 'list' });
  }

  // Detail view falls back to the list if the event vanished.
  if (view.mode === 'detail' && detailEvent) {
    return (
      <>
        <Blobs />
        <CountdownDetail
          event={detailEvent}
          onBack={() => setView({ mode: 'list' })}
          onEdit={() => openEdit(detailEvent.id)}
        />
        <CountdownForm
          opened={formOpen}
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <Blobs />
      <Box className="app-root" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Container size="xs" pt="xl" pb={120} px="md">
          <Stack gap={4} align="center" mb="xl" mt="sm">
            <Title order={1} style={{ fontSize: 'clamp(2rem, 9vw, 2.7rem)', letterSpacing: '-0.025em' }}>
              until
            </Title>
            <Text size="xs" fw={500} c="green.6" style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              every moment, on its way
            </Text>
          </Stack>

          {sorted.length === 0 ? (
            <Text ta="center" mt={60} c="green.4" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
              nothing yet — tap <b>＋ new</b> to begin counting.
            </Text>
          ) : (
            <Stack gap={8}>
              {sorted.map((ev) => {
                const d = targetDate(ev);
                const diff = d.getTime() - now;
                const past = diff <= 0;
                const parts = past ? null : summarize(now, d);
                return (
                  <Card
                    key={ev.id}
                    radius="md"
                    px="md"
                    py={10}
                    onClick={() => setView({ mode: 'detail', id: ev.id })}
                    style={{
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(116,178,146,0.28)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                    }}
                  >
                    <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Text fw={600} size="1rem" truncate style={{ letterSpacing: '-0.01em' }} c="green.9">
                          {ev.title}
                        </Text>
                        <Text size="xs" truncate c="green.5">{formatWhenShort(d)}</Text>
                      </Box>
                      {past ? (
                        <Badge color="green" variant="light" style={{ flexShrink: 0 }}>🎉 here</Badge>
                      ) : (
                        <Group gap={8} align="baseline" wrap="nowrap" style={{ flexShrink: 0 }}>
                          {parts.map((p, i) => (
                            <Text key={i} component="span" fw={700} style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }} c="green.8">
                              {p.v.toLocaleString('en-US')}
                              <Text component="span" fw={500} size="0.62rem" c="green.6" ml={2} style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                {p.name}{p.v === 1 ? '' : 's'}
                              </Text>
                            </Text>
                          ))}
                        </Group>
                      )}
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>

      <Button
        onClick={openNew}
        leftSection={<IconPlus size={16} />}
        radius="xl"
        size="md"
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom) + 1.4rem)',
          zIndex: 5,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: '0.82rem',
          boxShadow: '0 10px 28px rgba(61,107,81,0.32)',
        }}
      >
        new
      </Button>

      <CountdownForm
        opened={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  );
}

function Blobs() {
  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </>
  );
}
