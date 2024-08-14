package com.profit_loss.demo.Controller;

import com.profit_loss.demo.Service.ProfitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profit")
public class ProfitController {

    @Autowired
    private ProfitService profitService;

    @GetMapping
    public List<Double> getProfitHistory() {
        return profitService.getProfitHistory();
    }
}