---
title: "Implementing a kanban board - React"
summary: "Making Internationalization Easy with Next.js and react-intl"
date: "Apr 28 2023"
draft: false
tags:
- React
- Tutorial
---


Today we'll build this simple Kanban Board using NextJS and React-DND.

This is the final outcome.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1682633658234/0851eef3-dd81-496b-a932-00a76e04d11f.gif)

## Installation

Create a new Next ( or react ) app

```bash
npx create-next-app nextdnd
```

> I'm using Tailwind for the styling! so whenever you see {...style} it's just a bunch of tailwind classes. Also it's important to choose TS as a template.

Install React Drag & Drop Package

```bash
npm install react-dnd react-dnd-html5-backend
```

## Folder Structure

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1682633918802/0c13474f-4010-4899-8610-45c19c817749.png)

* **useHandleTicketsState**: where we'll manage our state
    
* **domain folde**r: our data and our types
    

The rest is the usual NextJS - React folders where we put our pages and our components.

For the components we have only 2; Column & Ticket

### Column

**Each** column will have a title ( State ) and a List to show the tickets with this state.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1682634071395/7d547b53-8091-4b40-867b-7b74a68d691d.png)

```typescript
// Our columns
export const canbanColumns = ["Backlog","Todo", "In Progress", "Testing", "Done"];
```

### Ticket

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1682634189263/1607f33d-86e0-483c-b82b-42008eba0112.png)

It just has a **title** and a **state**

### Types

```typescript
export type State = 'Todo' | 'In Progress' | 'Testing' | 'Done' | 'Backlog';

export type Ticket = {
  title:string;
  state:State;
  id:string;
}
```

## Philosophy Behind React-DnD

React-DnD makes drag & drop very easy. It has 2 main hooks we can use

* **useDrop**
    
* **useDrag**
    

We use the `useDrop` hook wherever we want to drop our components and use `useDrag` hook in the component we want to drag.

In this example, we want to drag tickets! So you guessed, we use the `useDrag` hook in the `Ticket` component and we use the `useDrop` hook in the `Column` component.

We can easily exchange data between the dragged component and where we want to drop.

### Ticket - Drag

```typescript
export function TicketCard({ticket}:{ticket:Ticket}){
    const [{ isDragging }, drag] = useDrag<
      Ticket,
      void,
      { isDragging: boolean;}
    >(() => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: 'ticket',
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      item: ticket,
      collect: monitor => ({
        // We use it to hide the ticket from the current Column when
        // start dragging.
        isDragging: monitor.isDragging(),
      }),
    }));
  return <div ref={drag} className={clsx('...style',{
    'hidden':isDragging
  })}>
        <p>{isDragging ? 'dragging' : ticket.title}</p>
        <span className='...style'>{ticket.state}</span>
       </div>
  }
```

As you can see, the `useDrag` hook is generic, the first Type represents the data we'll exchange between the Dragged component and where we will drop. In our case, it's the `Ticket` type.

The second type is not important in our case, it's just the return type of the `drop` method we use in the `useDrop` hook.

The last type is the return type of the `collect` method in both `useDrop` and `useDrag`. This method collects things we might need like whether the `TicketCard` is being dragged or is it dropped etc. ( All collected from the monitor instance )

The `type` property is very important, it's required for both `useDrop` and `useDrag (accepts in the useDrag hook)` and it's basically just a string to link the Draggable component and where it can be dropped. So if I put `ticket` in the `useDrag` of Ticket and I put also `ticket` in the `useDrop` in the Column component, this means that we can drop the Ticket on the Column.

The `item` is also very important, this is where we put the data we need to exchange between the `dragged` and where we `drop` our Ticket! You can consider it as a `prop` flying around while you're dragging and finally it gets to where you'll drop your `Component` through the `drop` method we'll see in a bit!

Finally, the `drag` is a `ref` we should pass it to our Component so that ReactDND can reference our element and track its position etc.

# Column - Drop

```typescript
export function CanbanColumn({ columnState,tickets,children,moveTicket }: PropsWithChildren<{ columnState: State, tickets:Ticket[], moveTicket:(ticket:Ticket,columnState:State)=>void}>) {
    const [{ isOver, canDrop }, drop] = useDrop<
    Ticket,
    void,
    { canDrop: boolean; isOver: boolean }
  >(() => ({
    accept: 'ticket',
    drop: ticket => {
        // do our logic here.
        moveTicket(ticket,columnState);
    },
    collect: monitor => ({
      // isOver is true when we the Ticket is ready to be dropped
      isOver: monitor.isOver(),
      // canDrop is true for all Columns that has the same 
      // `accept` property as the `type` property in the useDrag.
      // in this example all whenever we start dragging
      // All columns have `canDrop` true because the accept here is         // 'ticket' which is equal to the type in the useDrag.
      canDrop: monitor.canDrop(),
    }),
  }));
    return (
      <div ref={drop} className={clsx("...style",{
        "bg-slate-300":isOver,
        "ring ring-blue-200":canDrop
      })}>
        <p className='...style'>{columnState}</p>
        <div className={clsx("rounded-xl flex flex-col gap-2 p-2")}>
             {tickets.map(ticket=>
             <TicketCard 
                key={ticket.id} 
                ticket={ticket}/>)}
        </div>
      </div>
    );
  }
```

In the `useDrop` hook we have mostly the same property, except for the `accept` property which should have the same string as the `type` in the `useDrag` so that we can drop our `TicketCard` in the `Column`.

We also have the `drop` method which takes as a parameter the type we specified here `Ticket`. As we said earlier, we pass our data in the `item` property in `useDrag` it will fly around with the dragged `Component` and finally gets into this method! Here we can do whatever we want with this data.

The final piece of the puzzle would be our state. How we move `Tickets` between columns. For this, we'll check our `useHandleTicketsState` hook.

## State Management

Nothing fancy here, I'm not using redux or any state management library! Instead, I'm just using plain React to manage the state with the help of `useReducer`

> In This article I'm assuming you know the basics of useReducer hook! If not you can check it real quick, it's simple and very similar to redux actions, reducers logic.

```typescript
/*** 
We're using the discriminated union. So if the type is "move-tickets" TS will infer the payload as {newState:State...} and if the type is "reset" we won't have a payload.
*/
type Action =
  | { type: "move-ticket"; payload: { newState: State; ticket: Ticket } }
  | { type: "reset" };
const initialState = {
  tickets: {
    Backlog: [...tickets],
    Todo: [],
    "In Progress": [],
    Testing: [],
    Done: [],
  },
};
type TicketsState = {
  tickets: Record<State, Ticket[]>;
};
const reducer = (state: TicketsState, action: Action): TicketsState => {
  const { type } = action;
  switch (type) {
    case "move-ticket": {
      const { payload } = action;
      // If we try to drop the ticket on the same column this means 
      // we won't change the state so we just return it from the          //beginning
      return payload.newState === payload.ticket.state
        ? state
        : {
            ...state,
            tickets: {
              ...state.tickets,
              // we remove the ticket from the current column
              [payload.ticket.state]: state.tickets[
                payload.ticket.state
              ].filter((ticket) => ticket.id !== payload.ticket.id),
              // append it to the new column
              [payload.newState]: [
                ...state.tickets[payload.newState],
                { ...payload.ticket, state: payload.newState },
              ],
            },
          };
    }
    case "reset":
      // Here we just return the initial state.
      return {
        ...initialState,
      };
  }
};
export const useHandleTicketsState = () => {
  const [state, dispatch] = useReducer(reducer, { ...initialState });

  const moveTicket = useCallback(
    (ticket: Ticket, newState: State) =>
      dispatch({ type: "move-ticket", payload: { ticket, newState } }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return {
    state,
    reset,
    moveTicket,
  };
};
```

In a nutshell, our state is a simple object with `tickets` property. `tickets` is just a `Record` or an `object` with `key:State` and value is an array of `tickets`

This will make accessing `tickets` by state is really simple and in `constant` time.

We check the type of our action, if it's `move-ticket` we remove the `ticket` from the current column and append it to the new one. If the action is `reset` we just return the initial state where all tickets are in the `backlog`.

## Our Page

```typescript
export default function Home() {
  const {state,reset,moveTicket}=useHandleTicketsState();
  return (
    <DndProvider backend={HTML5Backend}>
    <main className={`p-2 flex min-h-screen bg-white gap-2 ${inter.className}`}>
      <button
     onClick={reset} 
      className="absolute bottom-4 left-4 rounded-lg bg-slate-950 text-white px-4 py-2">Reset</button>
            <div className="flex w-full gap-4">
        {canbanColumns.map((columnState) => (
          <CanbanColumn 
             tickets={state.tickets[columnState as State]} 
             key={columnState} 
             moveTicket={moveTicket} 
             columnState={columnState as State} />
        ))}
      </div>
    </main>
    </DndProvider>
  );
}
```

This is our Page! It's important to wrap our Components with the `DndProvider` and pass the backend to it. In this case, we installed the `HTML5Backend` along with `react-dnd`

Here we have a simple button to reset the state and a `CanbanColumn` component which takes the state, `moveTicket` method ( which is just a `dispatch` with action `move-ticket` and we pass as children our `tickets` of the corresponding state. ( This is one of the reasons why we used a `Record` or an `Object` so we don't have to use `Array.filter` , we just access our tickets by `ColumnState` directly ).

And That's all! Hope you enjoyed this article and learned something new!

> React DND has other cool features like custom layer if you want to show a custom component while you're dragging and much more! We just covered the basics and the most needed features in this Example.

## Conclusion

In This article, we learned how to use `react-dnd` to implement a simple `drag-and-drop` feature.

`react-dnd` provides mainly 2 hooks, one for the dragged component and the other where we'll drop it!

`useDrop` and `useDrag` should only be used in the components that are located under the `DndProvider`.

`useReducer` most of the time can replace many libraries if we learn how to use it and how to keep our state closest to where it is used!

GITHUBREPO: [https://github.com/hedi-ghodhbane/React-Drag-Drop](https://github.com/hedi-ghodhbane/React-Drag-Drop)