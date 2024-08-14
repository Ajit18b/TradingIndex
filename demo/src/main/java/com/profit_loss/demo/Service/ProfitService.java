package com.profit_loss.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ProfitService {

    private final Random random = new Random();
    private final List<Double> profitHistory = new ArrayList<>();
    private static final double MAX_PROFIT = 5000;
    private static final double MIN_PROFIT = 4;
    private static final double FLUCTUATION_PROBABILITY = 0.25; // 25% chance of fluctuation
    private static final double LOSS_PROBABILITY = 0.20; // 20% chance of a loss
    private static final double MAX_FLUCTUATION = 5.0; // Maximum fluctuation in units
    private static final double MAX_LOSS = 8.0; // Maximum loss in units

    @Scheduled(fixedRate = 30) // 1000 ms = 1 second
    public void updateProfit() {
        double newProfit;
        if (profitHistory.isEmpty()) {
            // Start with a random decimal number between MIN_PROFIT and 10
            newProfit = MIN_PROFIT + random.nextDouble() * (10 - MIN_PROFIT);
        } else {
            // Get the last profit value
            double lastProfit = profitHistory.get(profitHistory.size() - 1);

            // Define possible increments
            double increment = random.nextDouble() * 2.0; // Random increment between 0 and 2

            // Add a deflection with a probability
            if (random.nextDouble() < FLUCTUATION_PROBABILITY) {
                // Randomly decide to either increase or decrease the profit
                increment *= (random.nextBoolean() ? 1 : -1);
            }

            // Occasionally introduce a loss
            if (random.nextDouble() < LOSS_PROBABILITY) {
                // Subtract a loss with a maximum possible loss value
                increment -= random.nextDouble() * MAX_LOSS;
            }

            // Apply fluctuation bounds
            increment = Math.max(-MAX_FLUCTUATION, Math.min(increment, MAX_FLUCTUATION));

            // Generate a new profit value
            newProfit = lastProfit + increment;

            // Ensure the new profit does not exceed MAX_PROFIT and does not go below MIN_PROFIT
            newProfit = Math.max(MIN_PROFIT, Math.min(newProfit, MAX_PROFIT));
        }

        // Store the new profit in the list
        profitHistory.add(newProfit);
    }

    public List<Double> getProfitHistory() {
        return new ArrayList<>(profitHistory); // Return a copy of the list to avoid external modification
    }
}
