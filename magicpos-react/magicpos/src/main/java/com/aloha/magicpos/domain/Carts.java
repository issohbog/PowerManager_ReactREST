package com.aloha.magicpos.domain;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class Carts {
    private Long no;
    
    @JsonProperty("pNo")  // ← JSON의 "pNo"를 이 필드로 매핑
    private Long pNo;
    
    @JsonProperty("uNo")  // ← JSON의 "uNo"를 이 필드로 매핑
    private Long uNo;
    
    @JsonProperty("quantity")  // ← JSON의 "quantity"를 이 필드로 매핑
    private Long quantity;
}
