import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState } from 'react'

const people = [
	{ id: 1, name: 'Durward Reynolds' },
	{ id: 2, name: 'Kenton Towne' },
	{ id: 3, name: 'Therese Wunsch' },
	{ id: 4, name: 'Benedict Kessler' },
	{ id: 5, name: 'Katelyn Rohan' },
]

function Example() {
	const [selectedPerson, setSelectedPerson] = useState(people[0])
	const [query, setQuery] = useState('')

	const filteredPeople =
		query === ''
			? people
			: people.filter((person) => {
				return person.name.toLowerCase().includes(query.toLowerCase())
			})

	return (
		<Combobox value={selectedPerson} onChange={setSelectedPerson} onClose={() => setQuery('')}>
			<ComboboxInput
				aria-label="Assignee"
				displayValue={(person) => person?.name}
				onChange={(event) => setQuery(event.target.value)}
			/>
			<ComboboxOptions anchor="bottom" className="border empty:invisible">
				{filteredPeople.map((person) => (
					<ComboboxOption key={person.id} value={person} className="data-focus:bg-blue-100">
						{person.name}
					</ComboboxOption>
				))}
			</ComboboxOptions>
		</Combobox>
	)
}
