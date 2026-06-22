import { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Stack, SimpleGrid, Group, Text } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { IconTrash } from '@tabler/icons-react';
import { targetDate, timeStringOf, buildTarget } from './storage.js';

export default function CountdownForm({ opened, editing, onClose, onSubmit, onDelete }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  // Reset the fields whenever the modal opens (new vs. edit).
  useEffect(() => {
    if (!opened) return;
    setError('');
    if (editing) {
      setTitle(editing.title);
      setDate(targetDate(editing));
      setTime(timeStringOf(editing));
    } else {
      setTitle('');
      setDate(null);
      setTime('');
    }
  }, [opened, editing]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('Give it a name.');
    if (!date) return setError('Pick a date.');
    onSubmit({ title: title.trim(), target: buildTarget(date, time) });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? 'Edit countdown' : 'New countdown'}
      centered
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="What are you counting to?"
            placeholder="e.g. EAD Approval"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            maxLength={60}
            size="md"
            data-autofocus
          />

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
            <DatePickerInput
              label="Date"
              placeholder="Pick a date"
              value={date}
              onChange={setDate}
              valueFormat="MMM D, YYYY"
              size="md"
              popoverProps={{ withinPortal: true }}
            />
            <TimeInput
              label="Time"
              description="optional"
              value={time}
              onChange={(e) => setTime(e.currentTarget.value)}
              size="md"
            />
          </SimpleGrid>

          {error && <Text c="red.7" size="sm" ta="center">{error}</Text>}

          <Button type="submit" size="md" fullWidth mt="xs">
            Save
          </Button>

          {editing && (
            <Group justify="center">
              <Button
                variant="subtle"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={() => onDelete(editing.id)}
              >
                Delete
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
