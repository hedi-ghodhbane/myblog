---
title: "Flutter Cubit + Freezed: A Great Combination for State Management"
date: 2024-03-19
draft: false
---

# Flutter Cubit + Freezed: A Great Combination for State Management

## Introduction

State management is a crucial aspect of Flutter development, and choosing the right approach can significantly impact your app's maintainability and scalability. In this article, we'll explore how to combine Cubit (from the Bloc library) with Freezed to create a robust and type-safe state management solution.

## What is Cubit?

Cubit is a lightweight state management solution that's part of the Bloc library. It's simpler than Bloc but still provides a clean way to manage state in your Flutter applications. A Cubit is a class that extends `Cubit<State>` and uses `emit` to trigger state changes.

## What is Freezed?

Freezed is a code generation package that helps you create immutable classes with union types and pattern matching. It's particularly useful for creating state classes in a type-safe way.

## Setting Up the Project

First, let's add the necessary dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter_bloc: ^8.1.3
  freezed_annotation: ^2.4.1

dev_dependencies:
  build_runner: ^2.4.7
  freezed: ^2.4.5
```

## Creating the State

Let's create a simple counter app to demonstrate the combination of Cubit and Freezed. First, we'll define our state using Freezed:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'counter_state.freezed.dart';

@freezed
class CounterState with _$CounterState {
  const factory CounterState({
    required int count,
    @Default(false) bool isLoading,
    String? error,
  }) = _CounterState;
}
```

## Creating the Cubit

Now, let's create our Cubit:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_state.dart';

class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(const CounterState(count: 0));

  void increment() {
    emit(state.copyWith(
      count: state.count + 1,
      isLoading: false,
    ));
  }

  void decrement() {
    emit(state.copyWith(
      count: state.count - 1,
      isLoading: false,
    ));
  }
}
```

## Using the Cubit in the UI

Here's how we can use our Cubit in a Flutter widget:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_cubit.dart';
import 'counter_state.dart';

class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => CounterCubit(),
      child: const CounterView(),
    );
  }
}

class CounterView extends StatelessWidget {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: BlocBuilder<CounterCubit, CounterState>(
          builder: (context, state) {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Count: ${state.count}'),
                if (state.isLoading) const CircularProgressIndicator(),
                if (state.error != null) Text(state.error!),
              ],
            );
          },
        ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () => context.read<CounterCubit>().increment(),
            child: const Icon(Icons.add),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            onPressed: () => context.read<CounterCubit>().decrement(),
            child: const Icon(Icons.remove),
          ),
        ],
      ),
    );
  }
}
```

## Benefits of This Approach

1. **Type Safety**: Freezed ensures that our state is immutable and type-safe.
2. **Pattern Matching**: We can use pattern matching with Freezed to handle different states.
3. **Code Generation**: Freezed generates boilerplate code for us, reducing the chance of errors.
4. **Simplicity**: Cubit provides a simpler API than Bloc while maintaining the benefits of reactive programming.
5. **Testability**: Both Cubit and Freezed make it easy to write unit tests.

## Conclusion

The combination of Cubit and Freezed provides a powerful yet simple solution for state management in Flutter applications. It gives you type safety, immutability, and a clean API while keeping the codebase maintainable and scalable.

## Next Steps

1. Try implementing more complex state management scenarios
2. Explore the pattern matching capabilities of Freezed
3. Add error handling and loading states
4. Implement persistence for your state

Happy coding! 